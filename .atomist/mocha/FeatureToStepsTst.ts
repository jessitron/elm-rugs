/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "mocha";
import assert = require("power-assert");

import { notFoundIn } from "../editors/FeatureToSteps";

describe("Feature To Steps magic code editor", () => {

    it("should recognize a step among existing steps", () => {
        const yesStep = "banana handler";
        const existingSteps = ["some stuff", "(more) stuff", "([a-zA-Z0-9]+) handler"];

        assert(!notFoundIn(existingSteps, yesStep));
    });

    it("should not recognize a new step", () => {
        const notStep = "bana-na handler";
        const existingSteps = ["some stuff", "(more) stuff", "([a-zA-Z0-9]+) handler"];

        assert(notFoundIn(existingSteps, notStep));
    });

    it("should like do this regex thing", () => {
        const thisStep = "banana handler";
        const s = "([a-zA-Z0-9]+) handler";
        assert(new RegExp("^" + s + "$").test(thisStep));
    });

    it("should like not do this regex thing", () => {
        const thisStep = "bana-na handler";
        const s = "([a-zA-Z0-9]+) handler";
        assert(!new RegExp("^" + s + "$").test(thisStep));
    });

});
