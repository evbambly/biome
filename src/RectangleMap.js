import React, { useState, useEffect } from "react";
import { HexGrid, Layout, Hexagon, Text, Path } from "react-hexgrid";
import "../App.css";
import configs from "../configurations";
import {
  GetHexIndex,
  InitializeRectangularGrid,
  ModifyGrid,
  GROUND_TYPES,
  GetEmptyHexFromRectangleGrid,
  FindConflictingLayout,
} from "../HexUtils";
import Biome from "./biome";

const RectangleMap = ({ qLength, rLength, mapComponent, mapLayout }) => {
  const config = configs["rectangle"];
  const [hexagons, setHexagons] = useState([]);

  const layout = config.layout;
  const size = { x: layout.width, y: layout.height };

  useEffect(() => {
    const plainGrid = InitializeRectangularGrid(qLength, rLength);

    let customGrid = plainGrid;

    FindConflictingLayout(mapLayout);

    mapLayout?.forEach((layer) => {
      customGrid = ModifyGrid(customGrid, layer.hexes, layer.type);
    });

    setHexagons(customGrid);
  });

  useEffect(() => {
    const hexElements = document.getElementsByClassName("editable");

    if (hexElements instanceof HTMLCollection) {
      for (let i = 0; i < hexElements.length; i++) {
        const element = hexElements.item(i);
        element.onclick = (e) => {
          const chosenHexIndex = GetHexIndex(
            hexagons,
            GetEmptyHexFromRectangleGrid(i, qLength)
          );
          if (chosenHexIndex !== -1) {
            let nextHexagons = JSON.parse(JSON.stringify(hexagons));
            nextHexagons[chosenHexIndex].isMarked
              ? (nextHexagons[chosenHexIndex].isMarked = false)
              : (nextHexagons[chosenHexIndex].isMarked = true);
            setHexagons(nextHexagons);
          }
        };
      }
    }
  }, [hexagons]);

  const getHexText = (hex) => {
    return hex.height ?? "";
    //  const qText = hex.q < 0 ? "M" : "";
    // const rText = hex.r < 0 ? "R" : "";
    //  const sText = hex.s < 0 ? "=" : "";
    // return qText + rText + sText;
    //  return `${hex.q}${hex.r}${hex.s}`;
  };
  const setClassnames = (hex) => {
    let className = "editable";

    if (hex.isMarked) {
      className += " marked";
    }

    if (Object.values(GROUND_TYPES).includes(hex.groundType)) {
      className += ` ${hex.groundType}`;
    }

    hex.className = className;

    return hex;
  };
  const alertMarked = () => {
    let markedString = "[";
    hexagons
      .filter((hex) => hex.isMarked)
      .forEach(({ q, r, s }) => {
        markedString += `{q:${q},r:${r},s:${s}},`;
      });
    markedString += "]";
    alert(markedString);
  };

  const hexDisplay = hexagons?.map((hex) => setClassnames(hex));
  let flows = [];
  hexagons.forEach((hex) => {
    if (hex.flowedTo) {
      const { q, r, s } = hex.flowedTo;
      if (!isNaN(q + r + s)) {
        flows.push({ from: hex, to: hex.flowedTo });
      }
    }
  });

  return (
    <div>
      <button onClick={alertMarked}>Get Marked</button>
      <button onClick={() => setHexagons(Biome.GetFlow(hexagons))}>
        Get flow
      </button>
      <hr />
      <HexGrid width={config.width} height={config.height}>
        <Layout
          size={size}
          flat={layout.flat}
          spacing={layout.spacing}
          origin={config.origin}
        >
          {
            // note: key must be unique between re-renders.
            // using config.mapProps+i makes a new key when the goal template chnages.
            hexDisplay?.map((hex, i) => {
              return (
                <Hexagon
                  className={hex.className}
                  key={config.mapProps + i}
                  q={hex.q}
                  r={hex.r}
                  s={hex.s}
                  id={config.mapProps + i}
                >
                  <Text id={config.mapProps + i * 10}>{getHexText(hex)}</Text>
                </Hexagon>
              );
            })
          }
          {flows?.map((flow) => (
            <Path start={flow?.from} end={flow?.to} />
          ))}
        </Layout>
      </HexGrid>
    </div>
  );
};

export default RectangleMap;
