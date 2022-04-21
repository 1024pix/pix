RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[0;33m'
GREEN='\033[0;32m'

formatOutput() {
    TYPESCRIPT_FILES_RATE=$1
    if [ "$TYPESCRIPT_FILES_RATE" == 0 ]; then
        COLOR=$RED
    elif [ "$TYPESCRIPT_FILES_RATE" > 0 ] ; then
        COLOR=$YELLOW
    else
        COLOR=$NC
    fi
    echo -e "$DIRECTORY $COLOR${TYPESCRIPT_FILES_RATE}% ${NC}"
}

findTypescriptFilesCountInDirectory() {
    DIRECTORY=$1

    TYPESCRIPT_FILES_COUNT=$(find $DIRECTORY -type f -name '*.ts' -not -path ".//node_modules/**" | wc -l)
    JAVASCRIPT_FILES_COUNT=$(find $DIRECTORY -type f -name '*.js' -not -path ".//node_modules/**" | wc -l)
    typescriptFilesRate=$(echo "scale=2;$TYPESCRIPT_FILES_COUNT/($JAVASCRIPT_FILES_COUNT+$TYPESCRIPT_FILES_COUNT)*100" | bc -l)
    formatOutput $typescriptFilesRate
}

DIRECTORIES_TO_SCAN=$(find ./lib -maxdepth 2 -type d -not -path './node_modues/**')
for dir in $DIRECTORIES_TO_SCAN; do
    findTypescriptFilesCountInDirectory $dir
done
