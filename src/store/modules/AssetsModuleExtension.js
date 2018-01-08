export default class AssetsModuleExtension {
    constructor(firebaseRepository) {
        this.firebaseRepository = firebaseRepository;
    }

    get() {

        const self = this;

        return {
            namespaced: true,
            state: {
                localAssets: [],
                lastLoaded: new Date()
            },
            getters: {
                assets(state, getters, rootState) {
                    let prices = rootState.prices.pricesInUSD
                    return state.localAssets.map(asset => {
                        return {
                            ...asset,
                            coinValue: prices[asset.id],
                            totalValue: Math.trunc(prices[asset.id] * asset.coinCount)
                        }
                    })
                }
            },
            mutations: {
                setAssetsData: (state, assetsData) => state.localAssets = assetsData,
                updateLastLoaded: (state) => state.lastLoaded = new Date()
            },
            actions: {
                loadDataAsync({ commit }, name) {

                    return self.firebaseRepository.getAssetsAsync().then(assetsData => {
                        var assetsArray = []
                        Object.keys(assetsData).map(assetKey => {
                            assetsArray = [...Array(assetsData[assetKey])]
                        })

                        commit("setAssetsData", assetsArray);
                        commit("updateLastLoaded");

                        return assetsArray;
                    });

                }
            }
        }
    }
}