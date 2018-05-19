import autobind           from 'class-autobind';

import ModulesService     from './ModulesService.js';

export default class ModulesLoader {
    constructor(onLoad, onError) {
        autobind(this);

        this.onLoad  = onLoad;
        this.onError = onError;

        this.service = new ModulesService();

        this.steps = [["available",    this.service.Available   ],
                      ["installed",    this.service.Installed   ],
                      ["incompatible", this.service.Incompatible]];

        this.unfiltered = {
            installed:    null,
            available:    null,
            incompatible: null
        };

        this.values = {
            installed:    null,
            available:    null,
            incompatible: null
        };
    }

    load(ModuleFilter, search) {
        this.unfiltered = {
            installed:    null,
            available:    null,
            incompatible: null
        };
        // Clear everything out
        this.values = {
            installed:    null,
            available:    null,
            incompatible: null
        };
        this.onLoad(this.values);

        var mySteps = this.steps.slice();
        const whichFirst = mySteps.findIndex(step => step[0] === ModuleFilter);
        if (whichFirst >= 0) {
            var firstStep = mySteps[whichFirst];
            mySteps.splice(whichFirst, 1);
            this.doSteps([firstStep].concat(mySteps), search);
        }
    }

    // Usage: doSteps([["available",    this.service.Available   ],
    //                 ["installed",    this.service.Installed   ],
    //                 ["incompatible", this.service.Incompatible]]);
    doSteps(namesAndFuncs, search) {
        const [name, func] = namesAndFuncs[0];
        const rest         = namesAndFuncs.splice(1);
        func({}, (error, result) => {
            if (error) {
                this.onLoad({
                    installed:    null,
                    available:    null,
                    incompatible: null
                });
                this.onError(
                    "Error loading " + name + " modules!",
                    error.message
                );
            } else {
                this.unfiltered[name] = result;
                this.values[name] = this.matchingModules(result, search);

                this.onLoad(this.values);

                if (rest && rest.length > 0) {
                    this.doSteps(rest, search);
                }
            }
        });
    }

    redoSearch(search) {
        for (var filter in this.unfiltered) {
            this.values[filter] = this.matchingModules(this.unfiltered[filter], search);
        }
        this.onLoad(this.values);
    }

    matchingModules(modules, search) {
        if (!modules) {
            return [];
        }
        if (search == null) {
            return modules;
        }

        const lowerSearch = search.toLowerCase();

        // @Author search
        if (search.startsWith('@')) {
            const authorSearch = lowerSearch.substr(1);
            return modules.filter(mod =>
                mod.Authors && mod.Authors.find(auth =>
                    auth.toLowerCase().startsWith(authorSearch)
                )
            );
        }

        // Special searches
        if (search.startsWith('~')) {
            if (search.length <= 1) {
                return modules;
            } else switch (lowerSearch.substring(1, 2)) {

                // Upgradeable search
                case "u":
                    return modules.filter(m => m.Upgradeable);
                    break;

                // New search
                case "n":
                    // TODO
                    return modules;
                    break;

                // Conflict search
                case "c":
                    const conflictsWith = lowerSearch.substring(2);
                    // TODO
                    return modules;
                    break;

                // Depends search
                case "d":
                    const dependsOn = lowerSearch.substring(2);
                    // TODO
                    return modules;
                    break;

                default:
                    return modules;

            }
        }

        // Name/identifier/abbreviation/abstract search
        return modules.filter(mod =>
            mod.Abbrev.startsWith(lowerSearch)
            || mod.Identifier.toLowerCase().includes(lowerSearch)
            || mod.Name.toLowerCase().includes(lowerSearch)
            || mod.Abstract.toLowerCase().includes(lowerSearch)
        );
    }

    refresh(search, onError) {
        this.service.Refresh({}, (error, result) => {
            if (error) {
                onError(
                    "Error refreshing module list!",
                    error.message
                );
            } else {
                // TODO: Track which modules are new
                for (var prop in result) {
                    this.unfiltered[prop] = result[prop];
                    this.values[prop]     = this.matchingModules(result[prop], search);
                }
                this.onLoad(this.values);
            }
        });
    }

}
