let sortKeys = [
    { value: 'rank', accessor: x => x.priority == 0 ? Infinity : x.priority },
    { value: 'name', accessor: x => x.name, compare: (a,b, order) => order == 'asc' ? a.localeCompare(b) : b.localeCompare(a) },
    { value: 'price', accessor: x => x.price },
    { value: 'discount', accessor: x => x.discount },
    { value: 'selected', accessor: (x, app) => app.selected.includes(x.id) ? 0 : 1 }
]



document.addEventListener('DOMContentLoaded', () => {
    let app = new Vue({
        el: '.app',
        data: {
            input: '',
            error: false,
            list: [],
            selected: [],
            code: `copy(g_rgAppInfo)`,
            copiedCode: false,
            sortKey: sortKeys[0],
            sortKeys: sortKeys,
            sortOrder: 'asc',
            showOnlyDiscounted: false,
            nameFilter: '',
            copiedWishlistText: false,
            copiedAddToCartCode: false,
        },
        methods: {
            paste: function (e) {
                try {
                    let data = e.clipboardData.getData('text')
                    this.process(data)
                } catch (e) {
                    console.error(e)
                    this.error = true

                    setTimeout(() => {
                        this.error = false
                    }, 3000)
                }
            },
            process: function (data) {
                this.input = ''
                let json = JSON.parse(data)

                let list = Object.keys(json).filter(x => {
                    let game = json[x]
                    return game.subs.length > 0
                }).map(x => {
                    let game = json[x]

                    return {
                        id: x,
                        name: game.name.replace('&amp;', '&'),
                        image: game.capsule,
                        price: game.subs[0].price,
                        priceString: (game.subs[0].price / 100).toFixed(2),
                        discount: game.subs[0].discount_pct,
                        priority: game.priority,
                        link: `https://store.steampowered.com/app/${x}`,
                    }
                })

                this.list = list
            },
            click: function (id) {
                if (this.selected.includes(id)) {
                    this.selected = this.selected.filter(x => x != id)
                } else {
                    this.selected.push(id)
                }
            },
            copyCode: function() {
                navigator.clipboard.writeText(this.code).then(() => {
                    this.copiedCode = true

                    setTimeout(() => {
                        this.copiedCode = false
                    }, 3000)
                })
            },
            selectAll: function() {
                this.selected = this.list.map(x => x.id)
            },
            deselectAll: function() {
                this.selected = []
            },
            copyWishlistText: function() {
                let s = ''
                for(let id of this.selected) {
                    let game = this.list.find(x => x.id == id)

                    let gameString = `${game.name} - ${game.priceString} ${game.discount > 0 ? '(-' + game.discount + '%) ' : ''}--- ${game.link}`
                    s += gameString + '\n'
                }

                navigator.clipboard.writeText(s).then(() => {
                    this.copiedWishlistText = true

                    setTimeout(() => {
                        this.copiedWishlistText = false
                    }, 3000)
                })
            },
            copyAddToCartCode: function() {
                // let s = ''
                // for(let id of this.selected) {
                //     s += `addToCart(${id});\n`
                // }

                // let fn = `(() => {
                //     ${s}
                // })()`

                // navigator.clipboard.writeText(fn).then(() => {
                //     this.copiedAddToCartCode = true

                //     setTimeout(() => {
                //         this.copiedAddToCartCode = false
                //     }, 3000)
                // })
            }
        },
        computed: {
            total: function() {
                return (this.list.reduce((p,c) => {
                    return p + (this.selected.includes(c.id) ? c.price : 0)
                }, 0) / 100).toFixed(2)
            },
            sortedList: function() {
                let sorted = this.list.sort((a,b) => {
                    let aVal = this.sortKey.accessor(a, this)
                    let bVal = this.sortKey.accessor(b, this)
                    
                    if(this.sortKey.compare) {
                        return this.sortKey.compare(aVal, bVal, this.sortOrder)
                    } else {
                        return this.sortOrder == 'asc' ? aVal - bVal : bVal - aVal
                    }
                })

                if(this.showOnlyDiscounted) {
                    sorted = sorted.filter(x => x.discount > 0)
                }

                if(this.nameFilter.trim().length > 0) {
                    let lowerName = this.nameFilter.toLowerCase()
                    sorted = sorted.filter(x => x.name.toLowerCase().includes(lowerName))
                }

                return sorted
            }
        },
        mounted() {
            // this.process(data)
        }
    })
})
