module.exports = {
    packagerConfig: {
        icon:          'icon.icns',
        extraResource: ['../_build/out/CKAN/Release/bin/net45/']
    },
    makers: [
        {name:   '@electron-forge/maker-squirrel',
         config: {name: 'ckan'}},
        {name: '@electron-forge/maker-zip'},
        {name: '@electron-forge/maker-deb'},
        {name: '@electron-forge/maker-rpm'},
        {name: '@electron-forge/maker-dmg'}
    ],
    plugins: [
        [
            '@electron-forge/plugin-webpack',
            {mainConfig: './webpack.main.config.js',
             devContentSecurityPolicy: "img-src *; script-src 'self' 'unsafe-eval'",
             renderer:   {config: './webpack.renderer.config.js',
                          entryPoints: [
                              {name:    'main_window',
                               preload: {js: './Main/preload.js'},
                               html:    './Renderer/index.html',
                               js:      './Renderer/index.js'}]}}
        ]
    ]
};
