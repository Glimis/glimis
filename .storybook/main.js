module.exports = {
  "stories": [
    "../packages/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "framework": "@storybook/vue",
  webpackFinal: async (config, { configType }) => {

    config.module.rules.push({
      test: /\.sass$/,
      use: ['style-loader', 'css-loader', 
      {
        loader: 'sass-loader',
        options: {
          sassOptions: {
            indentedSyntax: true
          },
        },
      },
    ],
    });


    config.module.rules.push({
      test: /\.pug$/,
      use: ["pug-plain-loader"]
    });
    

    

    

    return config;
  }
}