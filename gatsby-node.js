exports.onCreatePage = ({ page, actions }) => {
    const { createPage } = actions

    const fullPages = ['signin', 'signup', 'pw-forget']
    const adminPages = ['products', 'admin', 'payments']

    if (fullPages.some(fp => page.path.match(new RegExp(fp)))) {
        page.context.layout = 'fullpage'
    } else if (adminPages.some(ap => page.path.match(new RegExp(ap)))) {
        page.context.layout = 'admin'
    }

    createPage(page)
}