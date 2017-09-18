<template>
  <div id="app">
    <v-app>
      <v-container fluid>
        <v-btn @click="model = true">test</v-btn>

        <v-mediabox
          :url="url"
          v-model="model"
          :categories="menus"
          search="Egypt"
          @selected="getValue"
        ></v-mediabox>

        <pre>
          <span v-html="dataset"></span>
        </pre>

        <p>Display selected item from mediabox</p>
        <v-card v-if="dataset" role="button" @click.stop="model = true">
          <v-card-media height="250px" :src="dataset.thumbnail">
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
      </v-container>
    </v-app>
  </div>
</template>

<script>
import Mediabox from '../src/Mediabox.vue'

export default {
  name: 'app',
  components: { 'v-mediabox': Mediabox },
  data () {
    return {
      model: false,
      dataset: null,
      url: '../src/assets/test-data.json',
      menus: [
        {
          icon: 'perm_media',
          name: 'All',
          count: '4',
          code: 'perm_media',
          url: '../src/assets/test-data.json',
        },
        {
          icon: 'collections',
          name: 'Collections',
          count: '4',
          code: 'collections',
          url: '../src/assets/test-data.collection.json',
        },
        {
          icon: 'album',
          name: 'Album',
          count: '4',
          code: 'album',
          url: '../src/assets/test-data.json',
        }
      ]
    }
  },
  methods: {
    'getValue'(value) {
      this.dataset = value
    }
  }
}
</script>

<style>
@import '~vuetify/dist/vuetify.min.css';
</style>
