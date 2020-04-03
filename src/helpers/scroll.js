const scrollToFirst = () => scrollTo(-10000, -1000)

const scrollLeft = () => scrollTo(-500, -100)

const scrollRight = () => scrollTo(500, 100)

const scrollToLast = () => scrollTo(10000, 1000)

const scrollTo = (scrollTo, interval) => {
    
    const container = document.querySelector('.rdg-root > .rdg-viewport')
    let scrollAmt = 0
    const slideTimer = setInterval(() => {
        container.scrollLeft += interval
        scrollAmt += interval
        if (scrollTo > 0 && scrollAmt >= scrollTo ||
            scrollTo < 0 && scrollAmt <= scrollTo
            ) {
            clearInterval(slideTimer);
        }
    }, 25)
}

const scroll = {
    scrollToFirst,
    scrollLeft,
    scrollRight,
    scrollToLast
}

export default scroll