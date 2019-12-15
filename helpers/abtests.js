import user from '../services/user';
import Tracking from './tracking';

class Abtests {

    constructor() {
        this.store = null;

        this.experiments = [];
    }

    setStore(store) {
        this.store = store;
    }

    setCookie(experimentId, variation) {
        let d = new Date();
        d.setTime(d.getTime() * 60 * 60 * 24 * 30);
        let expires = "expires=" + d.toUTCString();
        document.cookie = 'gace_' + experimentId + '=' + variation + ";" + expires + ";path=/";
    }

    /**
     * Checks cookie and creates one if it doesn't exist
     *
     * @param experimentId
     * @returns {Promise<boolean|{variation: number, info, status: *}|{variation: number, info, status: *}>}
     */
    async chooseVariation(experimentId = null) {
        if(experimentId) {
            // Check if cookie is set
            let current = await this.getCurrentVariation(experimentId);
            if (current) {
                return current;
            } else {
                // Otherwise randomize variation and set in cookie
                let rand = Math.random();
                let cumulative = 0;
                let variation = 0;
                let info = await this.getExperimentInfo(experimentId);

                if('variations' in info) {
                    for(let i = 0; i < info.variations.length; i++) {
                        if(info.variations[i].status === 'ACTIVE') {
                            cumulative += parseFloat(info.variations[i].weight);
                        }

                        if(rand < cumulative) {
                            variation = i;
                            break;
                        }
                    }
                }

                this.setCookie(experimentId, variation);

                // Fire off track event
                Tracking.trackExperiment({
                    experiment_id: experimentId,
                    experiment_name: info.name,
                    variation_id: variation,
                    variation_name: info.variations[variation].name
                });

                return {info, variation, status: info.status};
            }
        }
    }

    /**
     * Finds if cookie exists and returns experiment data associated
     *
     * @param experimentId
     * @returns {Promise<null|boolean|{variation: number, info, status: *}>}
     */
    async getCurrentVariation(experimentId = null) {
        if(experimentId) {
            let cookie = document.cookie.split(';').filter((item) => item.trim().startsWith('gace_' + experimentId + '='));

            if (cookie.length) {
                let info = await this.getExperimentInfo(experimentId);
                if(!info || info.status !== 'RUNNING') return false;

                let cookieSplit = cookie[0].split('=');
                let variation = parseInt(cookieSplit[cookieSplit.length -1]);

                return {info, variation, status: info.status};
            } else {
                return null;
            }
        }
    }

    getExperimentInfo(experimentId) {
        return user.getExperimentInfo(experimentId).then(resp => {
            return resp.info;
        });
    }
}

let abtests = new Abtests();
export default abtests;
