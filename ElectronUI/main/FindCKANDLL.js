import fs from 'fs';

// The DLL goes in the resources folder, but that doesn't exist at "npm start".
// Look for it in other places for dev and debugging.

const candidates = [
    'resources/net45/CKAN.dll',
    '../_build/out/CKAN/Release/bin/net45/CKAN.dll',
    '../_build/out/CKAN/Debug/bin/net45/CKAN.dll'
];

export default function FindCKANDLL() {
    for (var i = 0; i < candidates.length; ++i) {
        var filename = candidates[i];
        if (fs.existsSync(filename)) {
            return filename;
        } else {
            console.log(filename + " not found");
        }
    };
    throw "CKAN.dll not found";
}
