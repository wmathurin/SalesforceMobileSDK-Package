/*
 * Copyright (c) 2018-present, salesforce.com, inc.
 * All rights reserved.
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * - Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * - Neither the name of salesforce.com, inc. nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission of salesforce.com, inc.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

// Dependencies
var path = require('path'),
    SDK = require('./constants'),
    utils = require('./utils'),
    fs = require('fs');

//
// Helper to prepare template
// 
function prepareTemplate(config, templateDir) {
    var template = require(path.join(templateDir, 'template.js'));
    return utils.runFunctionThrowError(
        function () {
            return template.prepare(config, utils.replaceInFiles, utils.moveFile, utils.removeFile);
        },
        templateDir);
}

//
// Get templates for the given cli
//
function getTemplates(cli, templateSourceOrRepoUri, includeDescriptions) {
    try {

        // Creating tmp dir for template clone
        var tmpDir = utils.mkTmpDir();

        // Use provided source (git URL or local path) or fall back to default
        var source = templateSourceOrRepoUri || SDK.templatesRepoUri;
        var repoDir;
        if (fs.existsSync(source)) {
            // Local path
            repoDir = path.resolve(source);
        } else {
            // Git URL
            repoDir = utils.cloneRepo(tmpDir, source);
        }

        // Getting list of templates
        var templates = require(path.join(repoDir, 'templates.json'));

        // Keeping only applicable templates, adding full template url
        var applicableTemplates = templates
            .filter(template => cli.appTypes.includes(template.appType) && cli.platforms.filter(platform => template.platforms.includes(platform)).length > 0);

        // If descriptions are requested, add them to each template
        if (includeDescriptions) {
            applicableTemplates.forEach(function(template) {
                template.metadata = getTemplateMetadata(template.path, repoDir);
            });
        }

        // Cleanup
        utils.removeFile(tmpDir);

        return applicableTemplates;
    }
    catch (error) {
        utils.logError(cli.name + ' failed\n', error);
        process.exit(1);
    }
}

//
// Get appType for the given template given by its uri
//
function getAppTypeFromTemplate(templateRepoUriWithPossiblePath) {
    var templateUriParsed = utils.separateRepoUrlPathBranch(templateRepoUriWithPossiblePath);
    var templateRepoUri = templateUriParsed.repo + '#' + templateUriParsed.branch;
    var templatePath = templateUriParsed.path;

    // Creating tmp dir for template clone
    var tmpDir = utils.mkTmpDir();

    // Cloning template repo
    var repoDir = utils.cloneRepo(tmpDir, templateRepoUri);

    // Getting template
    var appType = require(path.join(repoDir, templatePath, 'template.js')).appType;

    // Cleanup
    utils.removeFile(tmpDir);

    // Done
    return appType;
}

//
// Extract template metadata from template.json file
//
function getTemplateMetadata(templatePath, repoDir) {
    try {
        var templateJsonPath = path.join(repoDir, templatePath, 'template.json');
        if (fs.existsSync(templateJsonPath)) {
            var templateJsonContent = fs.readFileSync(templateJsonPath, 'utf8');
            var templateData = JSON.parse(templateJsonContent);
            
            // Return all metadata properties from the template.json file
            // This makes the function more flexible for future use cases
            return templateData;
        }
    } catch (error) {
        // If there's any error reading or parsing the template.json, just return null
        // This ensures the command continues to work even if template.json parsing fails
    }
    return null;
}

//
// Display template list with optional metadata
//
function displayTemplateList(templates, source, cliName, commandPrefix, includeDescriptions) {
    var utils = require('./utils');
    var COLOR = require('./outputColors');
    var logInfo = utils.logInfo;
    var SDK = require('./constants');

    // Show which template repository is being used
    if (source) {
        logInfo('\nAvailable templates from custom repository:\n', COLOR.cyan);
        logInfo('Repository: ' + source, COLOR.cyan);
    } else {
        logInfo('\nAvailable templates:\n', COLOR.cyan);
    }

    for (var i = 0; i < templates.length; i++) {
        var template = templates[i];
        logInfo((i + 1) + ') ' + template.description, COLOR.cyan);

        var sourceForCommand = source || SDK.templatesRepoUri;
        var command = commandPrefix + ' --' + SDK.args.templateSource.name + '=' + sourceForCommand
            + ' --' + SDK.args.template.name + '=' + template.path;
        logInfo(command, COLOR.magenta);
        
        // If descriptions are requested and available, show them
        if (includeDescriptions && template.metadata) {
            if (template.metadata.description) {
                logInfo('   Description: ' + template.metadata.description, COLOR.white);
            }
            if (template.metadata.useCase) {
                logInfo('   Use Case: ' + template.metadata.useCase, COLOR.white);
            }
            if (template.metadata.features && Array.isArray(template.metadata.features)) {
                logInfo('   Features: ' + template.metadata.features.join(', '), COLOR.white);
            }
            if (template.metadata.complexity) {
                logInfo('   Complexity: ' + template.metadata.complexity, COLOR.white);
            }
        }
    }
    logInfo('');
}

module.exports = {
    prepareTemplate,
    getTemplates,
    getAppTypeFromTemplate,
    getTemplateMetadata,
    displayTemplateList
};
