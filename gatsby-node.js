exports.onCreatePage = ({ page, actions }) => {
    const { createPage } = actions

    const fullpages = ['signin', 'signup', 'pw-forget']

    if (fullpages.some(fp => page.path.match(new RegExp(fp)))) {
        page.context.layout = 'fullpage'
    }

    createPage(page)
}