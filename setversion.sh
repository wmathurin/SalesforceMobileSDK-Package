#!/bin/bash

#set -x

OPT_VERSION=""
OPT_IS_DEV="no"
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

usage ()
{
    echo "Use this script to set Mobile SDK version number in source files"
    echo "Usage: $0 -v <version> [-d <isDev>]"
    echo "  where: version is the version e.g. 7.1.0"
    echo "         isDev is yes or no (default) to indicate whether it is a dev build"
}

parse_opts ()
{
    while getopts v:d: command_line_opt
    do
        case ${command_line_opt} in
            v)  OPT_VERSION=${OPTARG};;
            d)  OPT_IS_DEV=${OPTARG};;
        esac
    done

    if [ "${OPT_VERSION}" == "" ]
    then
        echo -e "${RED}You must specify a value for the version.${NC}"
        usage
        exit 1
    fi
}

# Helper functions
update_package_json ()
{
    local file=$1
    local version=$2
    gsed -i "s/\"version\":.*\"[^\"]*\"/\"version\": \"${version}\"/g" ${file}
}

update_constants_js ()
{
    local file=$1
    local version=$2
    local isDev=$3
    local newPodSpecVersion="tag=\"v${version}\""
    gsed -i "s/var VERSION.*=.*'[^\"]*'/var VERSION= '${version}'/g" ${file}

    gsed -i "s/^\([ ]*\)[/][/]\(.*RepoUri\)/\1\2/g" ${file}    # uncomment uri's
    if [ $isDev == "yes" ]
    then
        gsed -i "s/^\(.*RepoUri.*#v\)/\/\/\1/g" ${file}      # comment uri's pointing to tag
    else
        gsed -i "s/^\(.*RepoUri.*#dev\)/\/\/\1/g" ${file}    # comment uri's pointing to dev
    fi
}


parse_opts "$@"

echo -e "${YELLOW}*** SETTING VERSION TO ${OPT_VERSION}, IS DEV = ${OPT_IS_DEV} ***${NC}"

echo "*** Updating package.json files ***"
update_package_json "./ios/package.json" "${OPT_VERSION}"
update_package_json "./android/package.json" "${OPT_VERSION}"
update_package_json "./sfdx/package.json" "${OPT_VERSION}"
update_package_json "./react/package.json" "${OPT_VERSION}"
update_package_json "./hybrid/package.json" "${OPT_VERSION}"

echo "*** Updating constants.js ***"
update_constants_js "./shared/constants.js" "${OPT_VERSION}" "${OPT_IS_DEV}"

