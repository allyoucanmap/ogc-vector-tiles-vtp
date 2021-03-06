<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" 
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" 
    xmlns="http://www.opengis.net/sld" 
    xmlns:ogc="http://www.opengis.net/ogc" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>Default</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
					
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#e4eeff</CssParameter>
            </Fill>
          </PolygonSymbolizer>
          
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#931eff</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </LineSymbolizer>
          
           <PointSymbolizer>
              <Graphic>
                <Mark>
                  <WellKnownName>circle</WellKnownName>
                </Mark>
            </Graphic>
          </PointSymbolizer>

        </Rule>
        </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
