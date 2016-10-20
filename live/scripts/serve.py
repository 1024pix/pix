'''
Taken from:
http://stackoverflow.com/users/1074592/fakerainbrigand
http://stackoverflow.com/questions/15401815/python-simplehttpserver

1/ ember build --env production
2/ cd dist
3/ python ../scripts/serve.py
'''

import SimpleHTTPServer, SocketServer
import urlparse, os

PORT = 5000
INDEXFILE = 'index.html'

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_GET(self):

    # Parse query data to find out what was requested
    parsedParams = urlparse.urlparse(self.path)

    # See if the file requested exists
    if os.access('.' + os.sep + parsedParams.path, os.R_OK):
      # File exists, serve it up
      SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self);
    else:
      # send index.html, but don't redirect
      self.send_response(200)
      self.send_header('Content-Type', 'text/html')
      self.end_headers()
      with open(INDEXFILE, 'r') as fin:
        self.copyfile(fin, self.wfile)

Handler = MyHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
