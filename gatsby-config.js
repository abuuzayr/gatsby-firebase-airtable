require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `Liveinpure`,
    siteUrl: `https://liveinpure.builtforfifty.com`,
    description: `Liveinpure CRM App`,
  },
  plugins: [`gatsby-plugin-sass`],
}