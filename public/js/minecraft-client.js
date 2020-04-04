//var ws = io.connect();

var cameraUuid = Math.floor(Math.random() * 1000000, 0);

ws.on("connected", function(name) {});
//ws.on("message", function(data) { moveObj(data);});
ws.on("disconnect", function() {});

ws.on("message", function(event){
    
    var objBody = document.getElementsByTagName("a-scene").item(0);
    
    //dataをパースする
    var data = JSON.parse(event);
    
    if (data.type == "defect") {
        var deleteTarget = document.getElementById(data.cameraid);
        objBody.removeChild(deleteTarget);
        return;
    }

    //自分のオブジェクト以外であること確認する（ないとは思うが）ｋ
    if (data.cameraId == cameraUuid) {
        return;
    }
    
    //オブジェクトを探してなければ作成する。
//    var targetElem = document.querySelector("#"+data.cameraId);
    var entity = document.getElementById(data.cameraId);
    if (entity == null) {
        console.log("create new creeper");
        entity = document.createElement("a-entity");
        entity.setAttribute("id", data.cameraId);
        entity.setAttribute("geometry",
            {
                "primitive": "plane",
                "height": 3,
                "width": 2,
                "position": data.position
            }
        );
        entity.setAttribute("material",
            {
                "shader": "standard",
                "transparent": true,
                "side": "double",
                "src": "url(https://cdn.glitch.com/85e614c3-8c59-4940-a1cf-44d38e346d3f%2Fcreeper.png?1527599163859)"
            }
        );
        objBody.appendChild(entity);
    }

    //オブジェクトのpos、rot設をを行う。
    entity.setAttribute("position", 
        {
            "x": data.position.x,
            "y": 1,
            "z": data.position.z
        });
    entity.setAttribute("rotation",
        {
            "x": 0,
            "y": data.rotation.y,
            "z": 0
        });
    
});

/*
window.onbeforeunload = function() {
    ws.send(JSON.stringify({
        type: 'defect',
        cameraId: cameraUuid
    }));
};
*/

function hyoji() {

    var camera = document.querySelector("#camera");
    ws.emit("message", JSON.stringify({
        type: 'move',
        cameraId: cameraUuid,
        position: camera.getAttribute("position"),
        rotation: camera.getAttribute("rotation")
    }));

    setTimeout("hyoji()", 100);
};

ws.emit("connection");

