<template>
    <v-dialog
        v-model="cmOpen"
        fullscreen
        lazy
        transition="dialog-bottom-transition"
        hide-overlay
    >
        <v-card flat tile class="grey lighten-4">
            <v-slide-y-transition>
                <v-toolbar
                  class="white"
                  dense
                  v-show="searchform.model"
                >
                    <v-text-field v-model="search" append-icon="search" hide-details single-line></v-text-field>
                </v-toolbar>
            </v-slide-y-transition>
            <v-toolbar class="grey darken-4 white--text">
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

                <div class="searchform-container">
                    <input v-model="searchform.query" class="searchform" type="text" placeholder="Search">
                    <i class="material-icons icon">search</i>
                </div>

                <v-btn v-if="!loading.model" dark icon @click.stop="dialogbox().close()"><v-icon>close</v-icon></v-btn>

                <v-progress-circular v-if="loading.model" indeterminate class="primary--text"></v-progress-circular>
            </v-toolbar>

            <!-- <v-divider></v-divider> -->

            <v-container fluid fill-height grid-list-lg>
                <v-layout row wrap fill-height class="pt-4">

                    <slot name="content">
                        <v-flex v-for="(dataset, i) in dataset.items" :key="i">
                            <v-scale-transition>
                                <div class="media--item" role="button" @click="mediabox().select(dataset)">
                                    <!-- @click.stop="computedDataset.select($event, item)" -->
                                    <slot name="media">
                                        <v-card class="elevation-1">
                                            <v-card-media :height="height" :src="dataset.thumbnail">
                                                <v-container fill-height fluid class="pa-0 white--text">
                                                    <v-layout column>
                                                        <v-slide-y-transition>
                                                            <v-icon ripple class="display-4 pa-4 success--text" v-if="dataset.active">check</v-icon>
                                                        </v-slide-y-transition>
                                                        <v-card-title class="subheading" v-html="dataset.name"></v-card-title>
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
                            </v-scale-transition>
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
            open: true,
            search: { type: String, default: null },
            selected: {},
            url: { type: String, default: null },
        },
        data () {
            return {
                dataset: {
                    selected: {},
                    items: []
                },
                dialog: {
                    model: false
                },
                media: {
                    model: null,
                    selected: null
                },
                loading: {
                    model: true
                },
                searchform: {
                    model: false
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

            this.api().get(this.url, this.query).then(data => {
                this.dataset.items = data.items
            })
        },
        methods: {
            api () {
                let self = this

                return {
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
                                    self.dataset.items = data.items
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
                        self.dataset.selected = item
                        self.dialogbox().toggle()
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
                console.log(value.name);
            },
            'search': function (value) {
                this.searchform.query = value
                this.$emit('search', value)
            },
        }
    }
</script>

<style lang="scss">
    .searchform {
        background: rgba(255,255,255,0.06);
        border-radius: 2px;
        display: block;
        padding: 0.5rem 1rem;
        color: white;

        &-container {
            position: relative;
        }

        + .icon {
            position: absolute;
            top: 0;
            left: 0;
        }
    }
</style>
