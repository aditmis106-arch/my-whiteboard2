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
    if (id && socket) {
      socket.emit("joinCanvas", { canvasId: id });

      const handleReceiveDrawingUpdate = (updatedElements) => {
        if (Array.isArray(updatedElements)) {
          setElements(updatedElements);
          setLastUpdateTime(Date.now());
        }
      };

      const handleLoadCanvas = (initialElements) => {
        if (Array.isArray(initialElements)) {
          setElements(initialElements);
          setHistory(initialElements);
        }
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
          setCanvasId(id);
          if (response.data.elements && Array.isArray(response.data.elements)) {
            setElements(response.data.elements);
            setHistory(response.data.elements);
          }
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
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
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
    if (!canvas || !elements) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      if (!element) return;
      
      try {
        switch (element.type) {
          case TOOL_ITEMS.LINE:
          case TOOL_ITEMS.RECTANGLE:
          case TOOL_ITEMS.CIRCLE:
          case TOOL_ITEMS.ARROW:
            if (element.roughEle) {
              roughCanvas.draw(element.roughEle);
            }
            break;
          case TOOL_ITEMS.BRUSH:
            if (element.points && element.stroke) {
              context.fillStyle = element.stroke;
              const path = new Path2D(getSvgPathFromStroke(getStroke(element.points)));
              context.fill(path);
            }
            break;
          case TOOL_ITEMS.TEXT:
            if (element.text && element.x1 !== undefined && element.y1 !== undefined) {
              context.textBaseline = "top";
              context.font = `${element.size || 32}px Caveat`;
              context.fillStyle = element.stroke || "#000000";
              context.fillText(element.text, element.x1, element.y1);
            }
            break;
          default:
            console.warn("Unknown element type:", element.type);
        }
      } catch (error) {
        console.error("Error rendering element:", error, element);
      }
    });

    context.restore();
  }, [elements]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING && textarea) {
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
    
    const now = Date.now();
    if (now - lastUpdateTime > 100 && socket && id) {
      socket.emit("drawingUpdate", { canvasId: id, elements });
      setLastUpdateTime(now);
    }
  };

  const handleMouseUp = () => {
    if (!isAuthorized) return;
    boardMouseUpHandler();
    
    if (socket && id) {
      socket.emit("drawingUpdate", { canvasId: id, elements });
    }
  };

  const handleTextBlur = (text) => {
    if (!isAuthorized) return;
    textAreaBlurHandler(text);
    
    setTimeout(() => {
      if (socket && id) {
        socket.emit("drawingUpdate", { canvasId: id, elements });
      }
    }, 100);
  };

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && elements.length > 0 && (
        <textarea
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1]?.y1 || 0,
            left: elements[elements.length - 1]?.x1 || 0,
            fontSize: `${elements[elements.length - 1]?.size || 32}px`,
            color: elements[elements.length - 1]?.stroke || "#000000",
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