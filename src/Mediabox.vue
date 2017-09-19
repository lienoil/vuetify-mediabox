<template>
    <v-dialog
        v-model="cmOpen"
        fullscreen
        lazy
        transition="dialog-bottom-transition"
        hide-overlay
    >
        <v-card flat tile class="grey lighten-4">
            <v-toolbar class="accent white--text">
                <slot name="toolbar">
                    <v-menu transition="slide-y-transition">
                        <v-btn flat slot="activator" class="white--text">
                            <v-icon left v-html="toolbar.items.category.selected.icon"></v-icon>
                            <span v-html="toolbar.items.category.selected.name"></span>
                            <v-icon right>arrow_drop_down</v-icon>
                        </v-btn>
                        <v-card>
                            <v-list>
                                <v-list-tile v-for="(item, i) in toolbar.items.category.items" :key="i" @click="toolbarbox().category().select(item)">
                                    <v-list-tile-action>
                                        <v-icon left v-html="item.icon"></v-icon>
                                    </v-list-tile-action>
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action v-if="item.count">
                                        <span class="grey--text" v-html="item.count"></span>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-menu>
                </slot>
                <v-spacer></v-spacer>

                <slot name="searchform" :searchform="searchform.query">
                    <v-text-field :prepend-icon="searchform.prepend" :prefix="searchform.prefix" @input="searchbox().search(searchform.query, $event)" placeholder="Search" light solo hide-details single-line append-icon="search" v-model="searchform.query"></v-text-field>
                </slot>

                <v-btn v-if="!loading.model" dark icon @click.stop="dialogbox().close()"><v-icon>close</v-icon></v-btn>

                <v-progress-circular v-if="loading.model" indeterminate class="primary--text"></v-progress-circular>
            </v-toolbar>

            <!-- <v-divider></v-divider> -->

            <v-container fluid fill-height grid-list-lg>
                <template v-if="dataset.items.length === 0">
                    <slot name="empty-result">
                        <v-layout row wrap fill-height>
                            <v-flex>
                                <div class="text-xs-center grey--text">
                                    <v-icon class="display-4 grey--text">fa-frown-o</v-icon>
                                    <div>There seems to be only loneliness here</div>
                                </div>
                            </v-flex>
                        </v-layout>
                    </slot>
                </template>
            </v-container>

            <v-container fluid fill-height grid-list-lg>

                <v-layout row wrap fill-height>

                    <slot name="content">
                        <v-flex v-for="(dataset, i) in api().dataset().get()" :key="i">
                            <v-slide-y-transition>
                                <div class="media--item" role="button" @click="mediabox().select(dataset)">
                                    <!-- @click.stop="computedDataset.select($event, item)" -->
                                    <slot name="media">
                                        <v-card class="elevation-1">
                                            <v-card-media style="min-width:300px" :height="height" :src="dataset.thumbnail">
                                                <v-container fill-height fluid class="pa-0 white--text">
                                                    <v-layout column>
                                                        <v-card-title class="subheading" v-html="dataset.name"></v-card-title>
                                                        <v-slide-y-transition>
                                                            <v-icon ripple class="display-4 pa-1 text-xs-center white--text" v-show="dataset.active">check</v-icon>
                                                        </v-slide-y-transition>
                                                        <v-spacer></v-spacer>
                                                        <v-card-actions class="px-2 white--text">
                                                            <v-icon class="white--text" v-html="dataset.icon"></v-icon>
                                                            <v-spacer></v-spacer>
                                                            <span v-html="dataset.mimetype"></span>
                                                            <span v-html="dataset.size"></span>
                                                        </v-card-actions>
                                                    </v-layout>
                                                </v-container>
                                            </v-card-media>
                                        </v-card>
                                    </slot>
                                </div>
                            </v-slide-y-transition>
                        </v-flex>
                    </slot>

                    <slot name="output" :output="dataset.selected"></slot>

                </v-layout>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: 'Mediabox',
        model: {
            prop: 'open'
        },
        props: {
            categories: { type: Array, default: () => { return [] } },
            height: { type: String, default: '250px' },
            multiple: { type: Boolean, default: false },
            old: { type: Array, default: () => { return [] } },
            open: true,
            search: { type: String, default: null },
            selected: {},
            url: { type: String, default: null },
        },
        data () {
            return {
                dataset: {
                    clone: [],
                    items: [],
                    selected: []
                },
                dialog: {
                    model: false
                },
                media: {
                    model: null,
                },
                loading: {
                    model: true
                },
                searchform: {
                    prefix: "",
                    prepend: '',
                    model: false,
                    query: null,
                    results: []
                },
                toolbar: {
                    model: true,
                    items: {
                        category: {
                            selected: {},
                            items: [{
                                name: 'All',
                                icon: 'collections',
                                code: 'all',
                                url: '/'
                            }]
                        }
                    }
                }
            }
        },
        computed: {
            cmDataset () {
                return this.dataset
            },

            cmOpen () {
                this.dialog.model = this.open
                return this.dialog.model
            }
        },
        mounted () {
            this.dialog.model = this.open
            this.loading.model = false

            this.toolbar.items.category.items = this.categories
            this.toolbar.items.category.selected = this.toolbar.items.category.items[0]

            // Searchform mount
            this.searchform.query = this.search

            this.api().get(this.toolbar.items.category.selected.url, this.toolbar.items.category.selected.query).then(data => {
                this.dataset.items = data.items
            })
        },
        methods: {
            api () {
                let self = this

                return {
                    dataset () {
                        return {
                            set (items) {
                                self.dataset.items = Object.assign(self.dataset.selected, items)
                                self.dataset.clone = Object.assign(self.dataset.selected, items)
                                self.$emit('set-items', self.dataset.items)
                                return self
                            },

                            get () {
                                self.$emit('get-items', self.dataset.items)
                                return self.dataset.items
                            },

                            select (selected) {
                                console.log(self.multiple)
                                if (self.multiple) {
                                    if (selected.active) {
                                        selected.active = false
                                        self.dataset.selected.splice(selected, 1)
                                        self.$emit('item-selected', self.dataset.selected)

                                        return self
                                    }
                                    selected.active = true
                                    self.dataset.selected.push(selected)
                                } else {
                                    // Single
                                    selected.active = true
                                    self.dataset.selected = selected
                                }

                                self.$emit('item-selected', self.dataset.selected)

                                return self
                            }
                        }
                    },

                    get (url, query) {
                        return new Promise((resolve, reject) => {
                            self.$http.get(url, query).then((response) => {
                                let items = response.body
                                resolve({items})
                            })
                        })
                    }
                }
            },

            toolbarbox () {
                let self = this

                return {
                    select (item, selected) {
                        item = selected

                        return item
                    },
                    category () {
                        return {
                            select (item) {
                                self.toolbar.items.category.selected = item
                                self.api().get(item.url, item.query).then(data => {
                                    self.api().dataset().set(data.items)
                                })
                                self.$emit('category-change', item)
                            }
                        }
                    }
                }
            },

            mediabox () {
                let self = this

                return {
                    select (item) {
                        self.api().dataset().select(item)
                        // self.searchbox().clear()

                        if (! self.multiple) {
                            self.dialogbox().toggle()
                        }
                    }
                }
            },

            dialogbox () {
                let self = this

                return {
                    toggle () {
                        self.dialog.model = !self.dialog.model
                    },

                    close () {
                        self.dialog.model = false
                    },

                    open () {
                        self.dialog.model = true
                    }
                }
            },

            searchbox () {
                let self = this

                return {
                    clear () {
                        self.searchbox().search("")
                    },

                    search (query, $event) {
                        self.loading.model = true

                        self.dataset.items = self.dataset.clone

                        let specificQuery = query.split(':');
                        if (specificQuery.length > 1) {
                            self.searchform.prepend = "fa-filter"
                        } else {
                            self.searchform.prepend = ""
                        }

                        let items = JSON.parse(JSON.stringify(self.dataset.items))

                        let results = items.filter((o) => {
                            let matches = []
                            Object.entries(o).forEach((key, index) => {
                                console.log(key[0].toString(), key[1].toString(), query.toLowerCase())

                                if (specificQuery[1]) {
                                    if (key[0].toString().toLowerCase().includes(specificQuery[0].toString().toLowerCase())) {
                                        if (key[1].toString().toLowerCase().includes(specificQuery[1].trim().toString().toLowerCase())) {
                                            matches.push(o)
                                        }
                                    }
                                } else {
                                    if (key[1].toString().toLowerCase().includes(query.trim().toString().toLowerCase())) {
                                        matches.push(o)
                                    }
                                }

                            })

                            return matches.length //o.name.toLowerCase().includes(query.toLowerCase())
                        })

                        self.dataset.items = results
                        console.log("Resulrs___________", results)

                        self.loading.model = false
                    }
                }
            }
        },
        watch: {
            'dialog.model': function (value) {
                this.dialog.model = value
                this.$emit('input', value)
            },
            'dataset.selected': function (value) {
                this.$emit('selected', value)
            },
            'toolbar.items.category.selected': function (value) {
                // console.log(value.name)
            },
            'search': function (value) {
                this.searchform.query = value
                this.$emit('search', value, this.searchform)
            },
            // 'old': function (value) {
            //     this.dataset.selected = value
            // }
        }
    }
</script>

<style lang="scss">
    //
</style>
