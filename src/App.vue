<template>
    <v-app dark class="pageWrap">
        <Header></Header>
        <main :class='{ loading: loading }'>
            <v-progress-circular class='loader' v-show='loading && !error' indeterminate v-bind:size="70" v-bind:width="5"></v-progress-circular>
            <router-view v-if="!loading && !error"></router-view>
        </main>
        <footer v-show='isLoggedIn'>
            <v-btn flat dark @click="logout">Logout</v-btn>
        </footer>
    </v-app>
</template>

<script>
    import Header from "@/components/Header.vue"
    import { mapGetters, mapState } from 'vuex';

    export default {
        name: 'app',
        components: {
            Header
        },
        dependencies: ['authHelpers'],
        computed: {
            ...mapState(["loading", "error"]),
            ...mapGetters(['isLoggedIn'])
        },
        methods: {
            logout() {
                this.authHelpers.logout()
            }
        },
        created() {
            if (this.isLoggedIn){
                this.$store.dispatch("loadAllData")
            }
        }
    }
</script>

<style lang='scss'>
    main {
        display: flex;
        justify-content: center;

        &.loading {
            align-items: center;
        }
    }

    .loader {
        svg circle {
            stroke: $borderSecondary
        }
    }

    footer {
        padding: 0 $size14px;
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
    }
</style>
