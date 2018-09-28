/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

require('./css/style.css');
const {join} = require('lodash');

const openlayersMap = require('./lib/openlayers');

const center = {lng: 32.61751911206343, lat: 36.09650048440878};
const zoom = 14;

const geoserverUrl = "http://localhost:8080/geoserver";
// layer group / layer
const layerName = "Daraa";
const schemeId = '900913';

// TMS `${geoserverUrl}/gwc/service/tms/1.0.0/${layerName}@EPSG%3A${schemeId}@pbf/{z}/{x}/{-y}.pbf`
// WFS `${geoserverUrl}/wfs3/collections/${layerName}/tiles/${schemeId}/{z}/{x}/{y}

const wfsUrl = `${geoserverUrl}/gwc/service/tms/1.0.0/${layerName}@EPSG%3A${schemeId}@pbf/{z}/{x}/{-y}.pbf`;

const spritesPath = "http://localhost:3000/sprites";

const layersInLayerGroup = [
    'AgricultureSrf',
    'VegetationSrf',
    'SettlementSrf',
    'MilitarySrf',
    'CultureSrf',
    'HydrographyCrv',
    'HydrographySrf',
    'TransportationGroundCrv',
    'UtilityInfrastructureCrv',
    'CulturePnt',
    'FacilityPnt',
    'StructurePnt',
    'UtilityInfrastructurePnt'
];

// set to true to set styles
const styled = false;

openlayersMap('vt-openlayers-map', wfsUrl, center, zoom, spritesPath, layersInLayerGroup, styled);

const requests = [
    {
        url: '/geoserver/wfs3/collections/',
        comment: 'WFS Request',
        path: ['layerName', 'tiles', 'schemeId', 'z', 'x', 'y'],
        params: {}
    }
];

const snippet = requests.map(req => {
    const params = req.params && Object.keys(req.params).map((key) => `<b>${key}</b>=<i>${req.params[key]}</i>`) || '';
    return '<div class="vt-comment"><small>' + req.comment + '</small></div>' + req.url + join((req.path || []).map(val => `<b>${val}</b>` ), '/') + join(params, ' &');
}, '');

document.getElementById('vt-snippet').innerHTML = join(snippet, '<br/>');
document.body.removeChild(document.getElementById('loading'));