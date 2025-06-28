import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import socket from "../../utils/socket";

import classes from "./index.module.css";

import {
  getSvgPathFromStroke,
} from "../../utils/element";
import getStroke from "perfect-freehand";
import axios from "axios";


function Board({ id }) {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  console.log(id)

  const {
    elements,
    toolActionType,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo,
    redo,
    setCanvasId,
    setElements,
    setHistory
  } = useContext(boardContext);
  const { toolboxState } = useContext(toolboxContext);

  const token = localStorage.getItem("whiteboard_user_token");

  const [isAuthorized, setIsAuthorized] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  useEffect(() => {
    if (id) {
      // Join the canvas room
      socket.emit("joinCanvas", { canvasId: id });

      // Listen for updates from other users
      const handleReceiveDrawingUpdate = (updatedElements) => {
        console.log("Received drawing update:", updatedElements);
        setElements(updatedElements);
        setLastUpdateTime(Date.now());
      };

      // Load initial canvas data
      const handleLoadCanvas = (initialElements) => {
        console.log("Loading initial canvas:", initialElements);
        setElements(initialElements);
        setHistory(initialElements);
      };

      const handleUnauthorized = (data) => {
        console.log(data.message);
        alert("Access Denied: You cannot edit this canvas.");
        setIsAuthorized(false);
      };

      socket.on("receiveDrawingUpdate", handleReceiveDrawingUpdate);
      socket.on("loadCanvas", handleLoadCanvas);
      socket.on("unauthorized", handleUnauthorized);

      return () => {
        socket.off("receiveDrawingUpdate", handleReceiveDrawingUpdate);
        socket.off("loadCanvas", handleLoadCanvas);
        socket.off("unauthorized", handleUnauthorized);
      };
    }
  }, [id, setElements, setHistory]);

  useEffect(() => {
    const fetchCanvasData = async () => {
      if (id && token) {
        try {
          const response = await axios.get(`https://api-whiteboard-az.onrender.com/api/canvas/load/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCanvasId(id); // Set the current canvas ID
          setElements(response.data.elements); // Set the fetched elements
          setHistory(response.data.elements); // Set the fetched elements
        } catch (error) {
          console.error("Error loading canvas:", error);
          if (error.response?.status === 403) {
            setIsAuthorized(false);
            alert("Access Denied: You don't have permission to view this canvas.");
          }
        }
      }
    };

    fetchCanvasData();
  }, [id, token, setCanvasId, setElements, setHistory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        redo();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.save();

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          roughCanvas.draw(element.roughEle);
          break;
        case TOOL_ITEMS.BRUSH:
          context.fillStyle = element.stroke;
          const path = new Path2D(getSvgPathFromStroke(getStroke(element.points)));
          context.fill(path);
          context.restore();
          break;
        case TOOL_ITEMS.TEXT:
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          context.restore();
          break;
        default:
          throw new Error("Type not recognized");
      }
    });

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [toolActionType]);

  const handleMouseDown = (event) => {
    if (!isAuthorized) return;
    boardMouseDownHandler(event, toolboxState);
  };

  const handleMouseMove = (event) => {
    if (!isAuthorized) return;
    boardMouseMoveHandler(event);
    
    // Only emit updates if this is a drawing action and enough time has passed
    const now = Date.now();
    if (now - lastUpdateTime > 50) { // Throttle updates to every 50ms
      socket.emit("drawingUpdate", { canvasId: id, elements });
      setLastUpdateTime(now);
    }
  };

  const handleMouseUp = () => {
    if (!isAuthorized) return;
    boardMouseUpHandler();
    
    // Always emit on mouse up to ensure final state is shared
    socket.emit("drawingUpdate", { canvasId: id, elements });
  };

  const handleTextBlur = (text) => {
    if (!isAuthorized) return;
    textAreaBlurHandler(text);
    
    // Emit update after text is added
    setTimeout(() => {
      socket.emit("drawingUpdate", { canvasId: id, elements });
    }, 100);
  };

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.stroke,
          }}
          onBlur={(event) => handleTextBlur(event.target.value)}
        />
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;