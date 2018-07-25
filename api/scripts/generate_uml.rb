#! /usr/bin/env ruby
#
# Ce script a pour but de générer l'UML des modèles du domaine. Le format est PlantUML (http://plantuml.com/class-diagram).
#
# /!\ ATTENTION /!\
# le script essaye d'inférer la classe d'un attribut à partir de son nom, mais parfois le nom ne matche pas.
# Exemple: AssessmentResult.JuryId => JuryId est une référence vers un User, pas un Jury
#
# C'est pour ça que la dernière étape du script est l'application de patches manuels pour corriger les classes.
# (Cf tout en bas du fichier).
#
# => Ces patches sont à faire évoluer avec le système
#

INPUT_FILES = './lib/domain/models/*.js'
OUTPUT_FILE = "output.uml"
NUMBER_OF_PAGES = 2
USAGE = <<EOS
Usage: generate_uml.rb

Generate PlantUML file of #{INPUT_FILES} files to the #{OUTPUT_FILE} file.

To transform the PlantUML file to an image you can either:
- use an IDE plugin (VS Code is known to work well)
- use `java -jar $PATH_TO/plantuml.jar #{OUTPUT_FILE}`
- copy the content of #{OUTPUT_FILE} to http://www.plantuml.com/plantuml
EOS

if ARGV.include? '-h' or ARGV.include? '--help'
  puts USAGE
  exit 0
end

classes = []
classes_attrs = {}

def parse_block(file, lines, stop_line, output_array)
  current_line = lines.next
  # puts "current_line=#{current_line}"
  while not current_line.include?(stop_line)
    matches = /this.(\w+) =/.match(current_line)
    if matches.nil?
      # puts "not found in line #{current_line}"
      # puts "from file #{file}"
      # puts "(stopping at #{stop_line})"
    else
      # puts "found #{matches[1]}"
      output_array.push(matches[1])
    end
    current_line = lines.next
  end
end

def find_matching_ref_relations(className, classes, references)
  # puts "class #{className}"
  output = []
  references.each do |relation|
    # puts "relation = #{relation}"
    type, relationTo = if relation.end_with? "Ids"
      # puts "ends with Ids"
      ["ref *", relation.sub("Ids", "")]
    elsif relation.end_with? "Id"
      # puts "ends with Id"
      ["ref 1", relation.sub("Id", "")]
    else
      # puts "other"
      ["???", relation]
    end
    relationTo = "#{relationTo[0].capitalize}#{relationTo[1..-1]}"
    relObject = { type: type, to: relationTo }
    puts "pushing #{relObject}"
    output.push(relObject)
  end
  # puts "output: #{output}"
  output
end

def find_matching_embed_relations(className, classes, references)
  output = []
  references.each do |relation|
    type, relationTo = if relation.end_with? "s"
      ["inc *", relation.sub(/s$/, "")]
    else
      ["inc 1", relation]
    end
    relationTo = "#{relationTo[0].capitalize}#{relationTo[1..-1]}"
    output.push({ type: type, to: relationTo })
  end

  output
end


Dir[INPUT_FILES].sort.each do |file|

  puts "parsing #{file}..."

  content = File.read(file)
  className = /class \w+/.match(content)[0]
  classes.push className

  unless /constructor/.match(content)
    next
  end

  idAttribute = []
  attributes = []
  includes = []
  references = []

  lines = content.lines.each
  current_line = nil

  # find constructor block
  while current_line != "  } = {}) {\n" && current_line != "  }) {\n"
    current_line = lines.next
  end

  # find id attribute name
  parse_block(file, lines, "// attributes", idAttribute)

  # find attributes
  parse_block(file, lines, "// includes", attributes)
  # find includes
  parse_block(file, lines, "// references", includes)
  # find references
  parse_block(file, lines, "  }\n", references)

  # puts "For class [#{className}], found:
  # idAttribute= #{idAttribute}
  # attributes=#{attributes}
  # includes=#{includes}
  # references=#{references}"

  className = className.split(" ")[1]
  classes_attrs[className] = {
    idAttribute: idAttribute,
    attributes: attributes,
    includes: includes,
    references: references
  }
  # break;
end

puts "==== references ===="
allClasses = classes_attrs.keys.map(&:to_s)
classes_attrs.each_pair do |className, properties|
  classes_attrs[className][:embed_relations] = find_matching_embed_relations(className, allClasses, properties[:includes])
  classes_attrs[className][:ref_relations] = find_matching_ref_relations(className, allClasses, properties[:references])
end

puts "==== WRITE FILE ===="

file = File.open(OUTPUT_FILE, "w+")
file << <<-EOS
@startuml
page #{NUMBER_OF_PAGES}x#{NUMBER_OF_PAGES}
EOS

classes_attrs.each_pair do |className, properties|
  file << "class #{className} {\n"

  properties[:idAttribute].each do |id|
    file << "  #{id}\n"
  end

  file << "  .. attributes ..\n"

  properties[:attributes].each do |attribute|
    file << "  #{attribute}\n"
  end

  file << "  .. includes ..\n"

  properties[:includes].each do |includes|
    file << "  #{includes}\n"
  end

  file << "  .. references ..\n"

  properties[:references].each do |relation|
    file << "  #{relation}\n"
  end

  file << "}\n"
end

file << "\n"

classes_attrs.each_pair do |className, properties|
  properties[:embed_relations].each do |embed_relation|
    file << "#{className} *-- #{embed_relation[:to]} : #{embed_relation[:type]}\n"
  end
  properties[:ref_relations].each do |ref_relation|
    file << "#{className} o-- #{ref_relation[:to]} : #{ref_relation[:type]}\n"
  end
end

file << "@enduml\n"

file.close

puts "===== PATCH FILE ======="

# FIXME: ici nous avons les patches à maintenir.
# La première string est celle que nous cherchons, la seconde est celle que nous voulons. Un patch par ligne
replacements = [
  ["Challenge o-- Skills : ???", "Challenge o-- Skill : ???"],
  ["Course *-- CompetenceSkill :", "Course *-- Skill :"],
  ["Course o-- Challenges : ???", "Course o-- Challenge : ???"],
  ["Course o-- Competences : ???", "Course o-- Competence : ???"],
  ["User *-- OrganizationsAccesse :", "User *-- OrganizationAccess :"],
  ["SkillReview *-- TargetedSkill :", "SkillReview *-- Skill :"],
  ["SkillReview *-- ValidatedSkill :", "SkillReview *-- Skill :"],
  ["SkillReview *-- FailedSkill :", "SkillReview *-- Skill :"],
  ["SkillReview *-- UnratableSkill :", "SkillReview *-- Skill :"],
  ["SmartPlacementAssessment *-- KnowledgeElement :", "SmartPlacementAssessment *-- SmartPlacementKnowledgeElement :"],
  ["AssessmentResult o-- Jury : ref 1", "AssessmentResult o-- User : ref 1"],
  ["Campaign o-- Creator : ref 1", "Campaign o-- User : ref 1"],
  ["Correction *-- LearningMoreTutorial : inc *", "Correction *-- Tutorial : inc *"]
]

uml_contents = File.read(OUTPUT_FILE)
replacements.each do |search, replacement|
  uml_contents.gsub!(search, replacement)
end
File.open(OUTPUT_FILE, "w") {|file| file.puts uml_contents }

puts "==== OUTPUT FILE ===="
puts File.read(OUTPUT_FILE)
