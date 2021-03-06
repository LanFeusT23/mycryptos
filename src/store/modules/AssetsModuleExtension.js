export default class AssetsModuleExtension {
    constructor(firebaseRepository) {
        this.firebaseRepository = firebaseRepository;
    }

    get() {

        const self = this;

        return {
            namespaced: true,
            state: {
                basicAssets: []
            },
            getters: {
                hasData(state) {
                    return state.basicAssets.length > 0;
                },
                assets(state, getters, rootState, rootGetters) {
                    let prices = rootState.prices.pricesInUSD
                    if (rootGetters.loading) {
                        return []
                    }

                    return state.basicAssets.map(asset => {
                        var assetPrice = prices[asset.id.toUpperCase()];
                        var totalValue = assetPrice * asset.coinCount;
                        var profit = totalValue - asset.investment;

                        return {
                            ...asset,
                            investment: +asset.investment.toFixed(0),
                            coinValue: assetPrice,
                            totalValue: Math.trunc(totalValue),
                            profit: +profit.toFixed(0),
                            isProfit: profit >= 0,
                            roi: +(profit / asset.investment * 100).toFixed(2)
                        }
                    })
                },
            },
            mutations: {
                updateLastLoaded: (state) => state.lastLoaded = new Date(),
                setAssetsData: (state, assetsData) => state.basicAssets = assetsData,
                toggleEditedAsset: (state, assetId) => {
                    var asset = state.basicAssets.find(a => {
                        return a.id === assetId
                    });

                    asset.editing = !asset.editing;
                },
                updateAsset: (state, { assetId, coinCount, investment }) => {                    
                    var asset = state.basicAssets.find(a => {
                        return a.id === assetId
                    });

                    asset.coinCount = coinCount;
                    asset.investment = investment;
                },
                addAsset: (state, { assetId, coinCount, investment }) => {                    
                    state.basicAssets.push({
                        id: assetId,
                        coinCount,
                        investment
                    });
                },
                deleteAsset: (state, assetId) => {
                    let index = state.basicAssets.findIndex(a => {
                        return a.id === assetId
                    });

                    state.basicAssets.splice(index, 1);
                }
            },
            actions: {
                async removeAssetAsync({ commit, rootState }, assetId) {
                    let results = await self.firebaseRepository.deleteCoinAsync(rootState.user, assetId);
                    commit("deleteAsset", assetId);
                },
                async loadDataAsync({ commit, rootState }) {

                    let userData = await self.firebaseRepository.getUserDataAsync(rootState.user)
                    if (userData === null) {
                        await self.firebaseRepository.createUser(rootState.user);
                        userData = {};
                    }

                    if (userData.readFrom) {
                        userData = await self.firebaseRepository.getUserDataAsync({
                            ...rootState.user,
                            uid: userData.readFrom
                        })
                    }

                    if (!userData.assets) {
                        userData = {
                            assets: {}
                        }
                    }
                    var assetsArray = Object.keys(userData.assets).map(assetKey => {
                        return {
                            ...userData.assets[assetKey]
                        }
                    })

                    commit("setAssetsData", assetsArray);
                    commit("updateLastLoaded");

                    return assetsArray;
                },
                async saveAssetAsync({ commit, rootState }, { assetId, coinCount, investment }) {
                    await self.firebaseRepository.updateCoinAsync(rootState.user, { assetId, coinCount, investment });
                    commit("updateAsset", {
                        assetId, 
                        coinCount, 
                        investment
                    })
                    commit("toggleEditedAsset", assetId)
                },
                async addAssetAsync({ commit, rootState }, { assetId, coinCount, investment }) {
                    await self.firebaseRepository.addCoin(rootState.user, { assetId, coinCount, investment });
                    commit("addAsset", {
                        assetId, 
                        coinCount, 
                        investment
                    })
                }
            }
        }
    }
}