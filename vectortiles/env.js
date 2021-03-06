/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    prod: {
        spritesPath: '"http://localhost:3000/www/sprites"',
        geoserverUrl: '"http://localhost:8080/geoserver/vtp"',
        sourceName: '"daraa_vtp"'
    },
    dev: {
        spritesPath: '"http://localhost:3000/sprites"',
        geoserverUrl: '"http://localhost:8080/geoserver/vtp"',
        sourceName: '"daraa_vtp"'
    }
};