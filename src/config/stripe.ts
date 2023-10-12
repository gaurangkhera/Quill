export const plans = [
    {
        name: 'Free',
        slug: 'free',
        quota: 10,
        pagesPerPdf: 5,
        price: {
            amount: 0,
            priceIds: {
                test: '',
                production: ''
            }
        }
    },
    {
        name: 'Pro',
        slug: 'pro',
        quota: 100,
        pagesPerPdf: 25,
        price: {
            amount: 49.99,
            priceIds: {
                test: 'price_1O0LloSGd6rD5NgHw96D91Wz',
                production: ''
            }
        }
    }
]