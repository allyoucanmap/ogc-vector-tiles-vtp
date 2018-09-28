/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Style = require('ol/style/Style').default;
const Fill = require('ol/style/Fill').default;
const Stroke = require('ol/style/Stroke').default;
const Circle = require('ol/style/Circle').default;
const Icon = require('ol/style/Icon').default;
const MultiLineString = require('ol/geom/MultiLineString').default;
const LayerVectorTile = require('ol/layer/VectorTile').default;
const VectorTile = require('ol/source/VectorTile').default;
const MVT = require('ol/format/MVT').default;
const View = require('ol/View').default;
const Map = require('ol/Map').default;
const { transform } = require('ol/proj');

const { createXYZ } = require('ol/tilegrid');

const { vec2 } = require('gl-matrix');

require('ol/ol.css');

/* extended vec2 from https://github.com/schteppe/p2.js/blob/master/src/math/vec2.js */
vec2.rotate = function (out, a, angle) {
    if (angle !== 0) {
        var c = Math.cos(angle),
            s = Math.sin(angle),
            x = a[0],
            y = a[1];
        out[0] = c * x - s * y;
        out[1] = s * x + c * y;
    } else {
        out[0] = a[0];
        out[1] = a[1];
    }
};
/* end */

const getAngle = (a, b) => Math.atan2(a[1] - b[1], a[0] - b[0]);
const getNormal = (a, b, scale) => {
    let normal = [];
    vec2.sub(normal, a, b);
    vec2.normalize(normal, normal);
    vec2.scale(normal, normal, scale);
    return normal;
};
const rotateNormal = (normal, angle) => {
    let normalRot = [];
    vec2.rotate(normalRot, normal, angle);
    return normalRot;
};

const getBridgeTickmarksGeometry = ({ strokeWidth = 20, pointA, pointA1, pointB, pointB1, currentResolution }) => {

    const angleA = getAngle(pointA, pointA1);
    const angleB = getAngle(pointB1, pointB);

    const position1 = [pointA[0] + (strokeWidth / 2) * currentResolution * Math.sin(angleA), pointA[1] - (strokeWidth / 2) * currentResolution * Math.cos(angleA)];
    const position2 = [pointA[0] - (strokeWidth / 2) * currentResolution * Math.sin(angleA), pointA[1] + (strokeWidth / 2) * currentResolution * Math.cos(angleA)];

    const position3 = [pointB[0] + (strokeWidth / 2) * currentResolution * Math.sin(angleB), pointB[1] - (strokeWidth / 2) * currentResolution * Math.cos(angleB)];
    const position4 = [pointB[0] - (strokeWidth / 2) * currentResolution * Math.sin(angleB), pointB[1] + (strokeWidth / 2) * currentResolution * Math.cos(angleB)];

    const tickmarkLength = 8 * currentResolution;

    const normalA = getNormal(pointA, pointA1, tickmarkLength);
    const normalB = getNormal(pointB, pointB1, tickmarkLength);

    const tickmarkRotation = 45;

    const normalARotN = rotateNormal(normalA, -tickmarkRotation);
    const normalARotP = rotateNormal(normalA, tickmarkRotation);

    const normalBRotN = rotateNormal(normalB, -tickmarkRotation);
    const normalBRotP = rotateNormal(normalB, tickmarkRotation);

    const tickmark1 = [
        position1,
        [position1[0] + normalARotN[0], position1[1] + normalARotN[1]]
    ];

    const tickmark2 = [
        position2,
        [position2[0] + normalARotP[0], position2[1] + normalARotP[1]]
    ];

    const tickmark3 = [
        position3,
        [position3[0] + normalBRotP[0], position3[1] + normalBRotP[1]]
    ];

    const tickmark4 = [
        position4,
        [position4[0] + normalBRotN[0], position4[1] + normalBRotN[1]]
    ];

    return [
        tickmark1,
        tickmark2,
        tickmark3,
        tickmark4
    ];
};

let zoom;

const defaultStyle = () => new Style({
    fill: new Fill({
        color: '#dddddd'
    }),
    stroke: new Stroke({
        color: '#333333',
        width: 0.5
    }),
    image: new Circle({
        radius: 4,
        fill: new Fill({
            color: '#000000'
        })
    })
});

const stylesFunc = (spritesPath) => ({
    CultureSrf: [
        feature => feature.get('layer') === 'CultureSrf' && new Style({
            fill: new Fill({
                color: 'rgba(171, 146, 210, 0.5)'
            })
        })
    ],
    MilitarySrf: [
        feature => feature.get('layer') === 'MilitarySrf' && new Style({
            fill: new Fill({
                color: 'rgba(243, 96, 47, 0.5)'
            })
        })
    ],
    UtilityInfrastructurePnt: [
        (feature, currentResolution) => feature.get('layer') === 'UtilityInfrastructurePnt' && currentResolution < 30 ? new Style({
            image: new Circle({
                radius: zoom > 13 && 8 || zoom > 8 && 5 || 1,
                fill: new Fill({
                    color: '#000000'
                })
            })
        }) : null
    ],
    UtilityInfrastructureCrv: [
        feature => feature.get('layer') === 'UtilityInfrastructureCrv' && feature.get('F_CODE') === 'AT005' ?
            new Style({
                stroke: new Stroke({
                    color: '#473895',
                    width: zoom > 13 && 4 || zoom > 8 && 1 || 1
                })
            }) : null
    ],
    VegetationSrf: [
        feature => feature.get('layer') === 'VegetationSrf' && new Style({
            fill: new Fill({
                color: '#C2E4B9'
            })
        })
    ],
    AgricultureSrf: [
        feature => feature.get('layer') === 'AgricultureSrf' &&
        new Style({
            fill: new Fill({
                color: 'rgba(3, 152, 89, 0.5)'
            })
        })
    ],
    SettlementSrf: [
        feature => feature.get('layer') === 'SettlementSrf' && new Style({
            fill: new Fill({
                color: 'rgba(232, 195, 178, 1.0)',
            }),
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 1.0)',
                width: zoom > 13 && 2 || zoom > 8 && 1 || 1
            })
        })
    ],
    HydrographySrf: [
        feature => feature.get('layer') === 'HydrographySrf' && feature.get('F_CODE') === 'BH082' ?
            new Style({
                fill: new Fill({
                    color: '#B0E1ED'
                }),
                stroke: new Stroke({
                    color: '#00A0C6',
                    width: 2
                })
            }) : null
    ],
    HydrographyCrv: [
        feature => feature.get('layer') === 'HydrographyCrv' && feature.get('F_CODE') === 'BH140' ?
            new Style({
                stroke: new Stroke({
                    color: '#00A0C6',
                    width: zoom > 13 && 4 || zoom > 8 && 2 || 1
                })
            }) : null
    ],
    TransportationGroundCrv: [
        (feature, currentResolution) => feature.get('layer') === 'TransportationGroundCrv' && currentResolution < 30 && feature.get('F_CODE') === 'AQ040' && feature.get('TRS') === 13 ?
            new Style({
                stroke: new Stroke({
                    color: '#000000',
                    width: 2
                }),
                geometry: (feature) => {

                    const coordinates = feature.getFlatCoordinates();

                    const pointA = [coordinates[0], coordinates[1]];
                    const pointA1 = [coordinates[2], coordinates[3]];

                    const pointB1 = [coordinates[coordinates.length - 4], coordinates[coordinates.length - 3]];
                    const pointB = [coordinates[coordinates.length - 2], coordinates[coordinates.length - 1]];
                    const strokeWidth = zoom > 13 && 20 || zoom > 8 && 9 || 1;
                    return new MultiLineString(getBridgeTickmarksGeometry({ strokeWidth, pointA, pointA1, pointB, pointB1, currentResolution }));
                }
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AQ040' && feature.get('TRS') === 13 ?
            new Style({
                stroke: new Stroke({
                    color: '#000000',
                    width: zoom > 13 && 20 || zoom > 8 && 9 || 1,
                    lineCap: 'butt'
                })
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AQ040' && feature.get('TRS') === 13 ?
            new Style({
                stroke: new Stroke({
                    color: '#ffffff',
                    width: zoom > 13 && 14 || zoom > 8 && 6 || 1,
                    lineCap: 'butt'
                })
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AP030' && feature.get('RIN_ROI') === 5 ?
            new Style({
                stroke: new Stroke({
                    color: '#000000',
                    width: zoom > 13 && 9 || zoom > 8 && 3.5 || 1
                })
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AP030' && feature.get('RIN_ROI') === 4 ?
            new Style({
                stroke: new Stroke({
                    color: '#000000',
                    width: zoom > 13 && 12 || zoom > 8 && 5 || 1
                })
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AP030' && feature.get('RIN_ROI') === 3 ?
            new Style({
                stroke: new Stroke({
                    color: '#000000',
                    width: zoom > 13 && 12 || zoom > 8 && 5 || 1
                })
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AP030' && feature.get('RIN_ROI') === 5 ?
            new Style({
                stroke: new Stroke({
                    color: '#ffffff',
                    width: zoom > 13 && 6 || zoom > 8 && 2 || 1
                })
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AP030' && feature.get('RIN_ROI') === 4 ?
            new Style({
                stroke: new Stroke({
                    color: '#cb171a',
                    width: zoom > 13 && 8 || zoom > 8 && 3 || 1
                })
            }) : null,
        feature => feature.get('layer') === 'TransportationGroundCrv' && feature.get('F_CODE') === 'AP030' && feature.get('RIN_ROI') === 3 ?
            new Style({
                stroke: new Stroke({
                    color: '#ff0000',
                    width: zoom > 13 && 8 || zoom > 8 && 3 || 1
                })
            }) : null
    ],
    FacilityPnt: [feature => feature.get('layer') === 'FacilityPnt' ? new Style({
        image: new Icon({
            size: [8, 8],
            anchor: [4, 4],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            src: `${spritesPath}/square.svg`
        })
    }) : null],
    CulturePnt: [feature => feature.get('layer') === 'CulturePnt' ? new Style({
        image: new Icon({
            size: [8, 8],
            anchor: [4, 4],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            src: `${spritesPath}/square.svg`
        })
    }) : null],
    StructurePnt: [feature => feature.get('layer') === 'StructurePnt' ? new Style({
        image: new Icon({
            size: [8, 8],
            anchor: [4, 4],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            src: `${spritesPath}/square.svg`
        })
    }) : null]
});

const openlayersMap = (target, url, center, startZoom, spritesPath, layersInLayerGroup = [], styled) => {

        const styles = stylesFunc(spritesPath);

        const source = new VectorTile({
            tilePixelRatio: 1,
            tileGrid: createXYZ({ maxZoom: 19 }),
            format: new MVT(),
            url
        });

        let layers = [];
        if (styled) {
            layers = layersInLayerGroup.reduce((newLayers, name) => {
                if (styles[name]) {
                    const vectorsTile = styles[name].map(style =>
                        new LayerVectorTile({
                            style,
                            source
                        })
                    );
    
                    return [
                        ...newLayers,
                        ...vectorsTile
                    ];
                }
                const vectorTile = new LayerVectorTile({
                    style: defaultStyle,
                    source
                });
                return [
                    ...newLayers,
                    vectorTile
                ];
            }, []);
        } else {
            layers = [
                new LayerVectorTile({
                    style: defaultStyle,
                    source
                })
            ];
        }

        new Map({
            target,
            view: new View({
                center: transform([center.lat, center.lng], 'EPSG:4326', 'EPSG:3857'),
                zoom: startZoom
            }),
            layers
        });
        zoom = startZoom;
};

module.exports = openlayersMap;