/*
 * Copyright (c) 2019-present, salesforce.com, inc.
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
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT OWNERS AND CONTRIBUTORS "AS IS"
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

const OclifAdapter = require('../../shared/oclifAdapter');
const { SfError } = require('@salesforce/core');

describe('OclifAdapter', () => {
    describe('getCustomProperties', () => {
        it('should parse template properties from remainingArgs array', () => {
            const remainingArgs = ['--template-property-xyz', '1', '--template-property-foo', '--template-property-def', 'abc'];
            const result = OclifAdapter.getCustomProperties(remainingArgs);
            expect(result).toEqual({ xyz: '1', def: 'abc' });
        });

        it('should return empty object for empty array', () => {
            const remainingArgs = [];
            const result = OclifAdapter.getCustomProperties(remainingArgs);
            expect(result).toEqual({});
        });

        it('should handle single template property with value', () => {
            const remainingArgs = ['--template-property-name', 'value'];
            const result = OclifAdapter.getCustomProperties(remainingArgs);
            expect(result).toEqual({ name: 'value' });
        });

        it('should skip template properties without values', () => {
            const remainingArgs = ['--template-property-foo', '--template-property-bar'];
            const result = OclifAdapter.getCustomProperties(remainingArgs);
            expect(result).toEqual({});
        });

        it('should skip template property at the end without value', () => {
            const remainingArgs = ['--template-property-xyz', '1', '--template-property-foo'];
            const result = OclifAdapter.getCustomProperties(remainingArgs);
            expect(result).toEqual({ xyz: '1' });
        });

        it('should handle multiple template properties with values', () => {
            const remainingArgs = [
                '--template-property-prop1', 'value1',
                '--template-property-prop2', 'value2',
                '--template-property-prop3', 'value3'
            ];
            const result = OclifAdapter.getCustomProperties(remainingArgs);
            expect(result).toEqual({
                prop1: 'value1',
                prop2: 'value2',
                prop3: 'value3'
            });
        });

        it('should handle multiple template properties with values using equals sign', () => {
            const remainingArgs = [
                '--template-property-prop1=value1',
                '--template-property-prop2=value2',
                '--template-property-prop3=value3'
            ];
            const result = OclifAdapter.getCustomProperties(remainingArgs);
            expect(result).toEqual({
                prop1: 'value1',
                prop2: 'value2',
                prop3: 'value3'
            });
        });

        it('should throw error with correct message when invalid template prefix is used', () => {
            const remainingArgs = ['--template-invalid', 'value'];
            let error;
            try {
                OclifAdapter.getCustomProperties(remainingArgs);
            } catch (e) {
                error = e;
            }
            expect(error).toBeInstanceOf(SfError);
            expect(error.message).toContain('Invalid template property flag: "--template-invalid"');
            expect(error.message).toContain('--template-property-');
            expect(error.name).toBe('InvalidTemplatePropertyPrefix');
        });

    });
});