/*
 * Copyright (c) 2024-present, salesforce.com, inc.
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

const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock dependencies
jest.mock('../sfdx/shared/utils', () => ({
    mkTmpDir: jest.fn(() => '/tmp/test-tmp-dir'),
    removeFile: jest.fn(),
    logError: jest.fn()
}));

jest.mock('../sfdx/shared/constants', () => ({
    templatesRepoUri: 'https://github.com/forcedotcom/SalesforceMobileSDK-Templates#dev'
}));

// Import after mocking
const utils = require('../sfdx/shared/utils');
const templateHelper = require('../sfdx/shared/templateHelper');

describe('templateHelper', () => {
    describe('getTemplates', () => {
        let mockCli;
        let mockTemplatesJson;
        let localTemplatePath;

        beforeEach(() => {
            // Reset all mocks before each test
            jest.clearAllMocks();
            
            // Mock console methods to suppress output during tests
            jest.spyOn(console, 'log').mockImplementation(() => {});
            jest.spyOn(console, 'error').mockImplementation(() => {});
            
            // Mock process.exit to prevent test terminationx
            jest.spyOn(process, 'exit').mockImplementation((code) => {
                throw new Error(`process.exit called with code ${code}`);
            });

            // Create a mock CLI object
            mockCli = {
                name: 'forceios',
                appTypes: ['native_swift', 'native'],
                platforms: ['ios']
            };

            // Create mock templates.json with two templates
            mockTemplatesJson = [
                {
                    path: 'Template1',
                    description: 'First Template',
                    appType: 'native_swift',
                    platforms: ['ios']
                },
                {
                    path: 'Template2',
                    description: 'Second Template',
                    appType: 'native',
                    platforms: ['ios']
                }
            ];

            // Create a temporary local directory for templates
            localTemplatePath = fs.mkdtempSync(path.join(os.tmpdir(), 'test-templates'));

            // Create templates.json file
            const templatesJsonPath = path.join(localTemplatePath, 'templates.json');
            fs.writeFileSync(templatesJsonPath, JSON.stringify(mockTemplatesJson, null, 2));
        });

        afterEach(() => {
            // Clean up temp template directory
            if (localTemplatePath && fs.existsSync(localTemplatePath)) {
                fs.rmSync(localTemplatePath, { recursive: true, force: true });
            }
            // Restore all mocks after each test
            jest.restoreAllMocks();
        });

        it('should get templates from local drive with two templates', () => {
            // Call getTemplates with local path
            const result = templateHelper.getTemplates(mockCli, localTemplatePath, false);

            // Verify both templates are returned (both match the CLI criteria)
            expect(result).toHaveLength(2);
            expect(result[0].path).toBe('Template1');
            expect(result[0].description).toBe('First Template');
            expect(result[0].appType).toBe('native_swift');
            expect(result[0].platforms).toEqual(['ios']);

            expect(result[1].path).toBe('Template2');
            expect(result[1].description).toBe('Second Template');
            expect(result[1].appType).toBe('native');
            expect(result[1].platforms).toEqual(['ios']);

            // Verify cleanup was called (removeFile for tmpDir)
            // Note: For local paths, tmpDir is still created but may not be used
            expect(utils.removeFile).toHaveBeenCalled();
        });
    
        it('should include metadata when includeDescriptions is true', () => {
            // Create template.json files for each template
            const template1Dir = path.join(localTemplatePath, 'Template1');
            const template2Dir = path.join(localTemplatePath, 'Template2');
            fs.mkdirSync(template1Dir, { recursive: true });
            fs.mkdirSync(template2Dir, { recursive: true });

            const template1Metadata = {
                description: 'Metadata for Template1',
                useCase: 'Test use case 1',
                features: ['feature1', 'feature2']
            };
            const template2Metadata = {
                description: 'Metadata for Template2',
                useCase: 'Test use case 2',
                features: ['feature3', 'feature4']
            };

            fs.writeFileSync(path.join(template1Dir, 'template.json'), JSON.stringify(template1Metadata, null, 2));
            fs.writeFileSync(path.join(template2Dir, 'template.json'), JSON.stringify(template2Metadata, null, 2));

            // Call getTemplates with includeDescriptions = true
            const result = templateHelper.getTemplates(mockCli, localTemplatePath, true);

            // Verify metadata was added to each template
            expect(result).toHaveLength(2);
            expect(result[0].metadata).toBeDefined();
            expect(result[0].metadata.description).toBe('Metadata for Template1');
            expect(result[0].metadata.useCase).toBe('Test use case 1');
            expect(result[1].metadata).toBeDefined();
            expect(result[1].metadata.description).toBe('Metadata for Template2');
            expect(result[1].metadata.useCase).toBe('Test use case 2');
        });
    });

    describe('getCustomProperties', () => {
        it('should return custom properties when metadata has the full path', () => {
            const metadata = {
                properties: {
                    templatePrerequisites: {
                        properties: {
                            templateProperties: {
                                appName: { type: 'string' },
                                orgId: { type: 'string' }
                            }
                        }
                    }
                }
            };

            const result = templateHelper.getCustomProperties(metadata);

            expect(result).toEqual({
                appName: { type: 'string' },
                orgId: { type: 'string' }
            });
        });

        it('should return null when metadata is null', () => {
            const result = templateHelper.getCustomProperties(null);
            expect(result).toBeNull();
        });

        it('should return null when metadata is undefined', () => {
            const result = templateHelper.getCustomProperties(undefined);
            expect(result).toBeNull();
        });

        it('should return null when properties is missing', () => {
            const metadata = {};
            const result = templateHelper.getCustomProperties(metadata);
            expect(result).toBeNull();
        });

        it('should return null when templatePrerequisites is missing', () => {
            const metadata = {
                properties: {}
            };
            const result = templateHelper.getCustomProperties(metadata);
            expect(result).toBeNull();
        });

        it('should return null when templatePrerequisites.properties is missing', () => {
            const metadata = {
                properties: {
                    templatePrerequisites: {}
                }
            };
            const result = templateHelper.getCustomProperties(metadata);
            expect(result).toBeNull();
        });

        it('should return null when templateProperties is missing', () => {
            const metadata = {
                properties: {
                    templatePrerequisites: {
                        properties: {}
                    }
                }
            };
            const result = templateHelper.getCustomProperties(metadata);
            expect(result).toBeNull();
        });
    });

    describe('getCustomCommandArgs', () => {
        it('should return command args array for custom properties', () => {
            const customPropertiesMetadata = {
                properties: {
                    appName: { type: 'string' },
                    orgId: { type: 'string' },
                    apiVersion: { type: 'string' }
                }
            };

            const result = templateHelper.getCustomCommandArgs(customPropertiesMetadata);

            expect(result).toEqual([
                '--template-property-appName=<APP_NAME>',
                '--template-property-orgId=<ORG_ID>',
                '--template-property-apiVersion=<API_VERSION>'
            ]);
        });

        it('should return empty array when properties is empty', () => {
            const customPropertiesMetadata = {
                properties: {}
            };

            const result = templateHelper.getCustomCommandArgs(customPropertiesMetadata);

            expect(result).toEqual([]);
        });

        it('should return empty array when properties is missing', () => {
            const customPropertiesMetadata = {};

            const result = templateHelper.getCustomCommandArgs(customPropertiesMetadata);

            expect(result).toEqual([]);
        });

        it('should return empty array when input is null', () => {
            const result = templateHelper.getCustomCommandArgs(null);
            expect(result).toEqual([]);
        });

        it('should return empty array when input is undefined', () => {
            const result = templateHelper.getCustomCommandArgs(undefined);
            expect(result).toEqual([]);
        });

        it('should handle property names with camelCase correctly', () => {
            const customPropertiesMetadata = {
                properties: {
                    myPropertyName: { type: 'string' },
                    anotherProperty: { type: 'string' }
                }
            };

            const result = templateHelper.getCustomCommandArgs(customPropertiesMetadata);

            expect(result).toEqual([
                '--template-property-myPropertyName=<MY_PROPERTY_NAME>',
                '--template-property-anotherProperty=<ANOTHER_PROPERTY>'
            ]);
        });
    });
});

