// geometry transformation
function PointTransformation(point, origin, rotation, translation){
    let [qx, qy, qz, qw] = rotation;

    // rotation matrix from quaternion
    let rxx = 1 - 2*qy*qy - 2*qz*qz;
    let rxy = 2*qx*qy - 2*qw*qz;
    let rxz = 2*qx*qz + 2*qw*qy;
    let ryx = 2*qx*qy + 2*qw*qz;
    let ryy = 1 - 2*qx*qx - 2*qz*qz;
    let ryz = 2*qy*qz - 2*qw*qx;
    let rzx = 2*qx*qz - 2*qw*qy;
    let rzy = 2*qy*qz + 2*qw*qx;
    let rzz = 1 - 2*qx*qx - 2*qy*qy;

    let [xb, yb, zb] = [point[0] - origin[0], point[1] - origin[1], point[2] - origin[2]];

    let xa = rxx*xb + rxy*yb + rxz*zb;
    let ya = ryx*xb + ryy*yb + ryz*zb;
    let za = rzx*xb + rzy*yb + rzz*zb;

    return [
        xa + origin[0] + translation[0],
        ya + origin[1] + translation[1],
        za + origin[2] + translation[2]
    ];
}

function exportGingiva(objName, addBefore, addAfter, offsetBefore, offsetAfter) {
    if (!scene.sceneObjectsByName[objName]) return;

    let gingivaObj = scene.sceneObjectsByName[objName];
    let jawPivot = gingivaObj.parent.basis;
    let jawRotation = gingivaObj.parent.lrotation;
    let jawTranslation = gingivaObj.parent.lposition;

    function writeObjData(label, header, body, addText, offsetTracker) {
        let nv = header.vertexCount;
        let nt = header.triangleCount;

        addText(`o ${label}_${objName}`);
        for (let v = 0; v < nv; v++) {
            let point = body.vertices.subarray(3*v, 3*v+3);
            let [xa, ya, za] = PointTransformation(point, jawPivot, jawRotation, jawTranslation);
            addText(`v ${xa} ${ya} ${za}`);
        }

        for (let v = 0; v < nv; v++) {
            let point = body.normals.subarray(3*v, 3*v+3);
            let [xa, ya, za] = PointTransformation(point, [0,0,0], jawRotation, [0,0,0]);
            addText(`vn ${xa} ${ya} ${za}`);
        }

        for (let t = 0; t < nt; t++) {
            let a = body.indices[3*t] + offsetTracker.index;
            let b = body.indices[3*t+1] + offsetTracker.index;
            let c = body.indices[3*t+2] + offsetTracker.index;
            addText(`f ${a}//${a} ${b}//${b} ${c}//${c}`);
        }

        offsetTracker.index += nv;
    }

    writeObjData("before", gingivaObj.obj.originBuffer.init_ctm.header, gingivaObj.obj.originBuffer.init_ctm.body, addBefore, offsetBefore);
    writeObjData("after", gingivaObj.obj.morphTargets[1].init_ctm.header, gingivaObj.obj.morphTargets[1].init_ctm.body, addAfter, offsetAfter);
}

function exportTooth(toothIndex, addBefore, addAfter, offsetBefore, offsetAfter) {
    let objName = 'Tooth_' + toothIndex.toString().padStart(2, '0');
    if (!scene.sceneObjectsByName[objName]) return;

    let tooth = scene.sceneObjectsByName[objName];
    let objHeader = tooth.obj.originBuffer.init_ctm.header;
    let objBody = tooth.obj.originBuffer.init_ctm.body;

    let jawPivot = tooth.parent.basis;
    let jawRotation = tooth.parent.lrotation;
    let jawTranslation = tooth.parent.lposition;

    let nv = objHeader.vertexCount;
    let nt = objHeader.triangleCount;

    // Before
    addBefore('o before_' + objName);
    for (let v = 0; v < nv; v++) {
        let point = objBody.vertices.subarray(3*v, 3*v+3);
        let [xa, ya, za] = PointTransformation(point, jawPivot, jawRotation, jawTranslation);
        addBefore(`v ${xa} ${ya} ${za}`);
    }
    for (let v = 0; v < nv; v++) {
        let point = objBody.normals.subarray(3*v, 3*v+3);
        let [xa, ya, za] = PointTransformation(point, [0,0,0], jawRotation, [0,0,0]);
        addBefore(`vn ${xa} ${ya} ${za}`);
    }
    for (let t = 0; t < nt; t++) {
        let a = objBody.indices[3*t] + offsetBefore.index;
        let b = objBody.indices[3*t+1] + offsetBefore.index;
        let c = objBody.indices[3*t+2] + offsetBefore.index;
        addBefore(`f ${a}//${a} ${b}//${b} ${c}//${c}`);
    }
    offsetBefore.index += nv;

    // After
    let objPivot = tooth.basis;
    let objRotation = tooth.motion.controllers[1][4].lastKey.value;
    let objTranslation = tooth.motion.controllers[0].map(e => e.lastKey.value);

    addAfter('o after_' + objName);
    for (let v = 0; v < nv; v++) {
        let point = objBody.vertices.subarray(3*v, 3*v+3);
        let p1 = PointTransformation(point, objPivot, objRotation, objTranslation);
        let [xa, ya, za] = PointTransformation(p1, jawPivot, jawRotation, jawTranslation);
        addAfter(`v ${xa} ${ya} ${za}`);
    }
    for (let v = 0; v < nv; v++) {
        let point = objBody.normals.subarray(3*v, 3*v+3);
        let p1 = PointTransformation(point, objPivot, objRotation, objTranslation);
        let [xa, ya, za] = PointTransformation(p1, [0,0,0], jawRotation, [0,0,0]);
        addAfter(`vn ${xa} ${ya} ${za}`);
    }
    for (let t = 0; t < nt; t++) {
        let a = objBody.indices[3*t] + offsetAfter.index;
        let b = objBody.indices[3*t+1] + offsetAfter.index;
        let c = objBody.indices[3*t+2] + offsetAfter.index;
        addAfter(`f ${a}//${a} ${b}//${b} ${c}//${c}`);
    }
    offsetAfter.index += nv;
}

// Output buffers
let topBeforeText = '';
let topAfterText = '';
let bottomBeforeText = '';
let bottomAfterText = '';

const addTopBefore = txt => topBeforeText += txt + '\n';
const addTopAfter = txt => topAfterText += txt + '\n';
const addBottomBefore = txt => bottomBeforeText += txt + '\n';
const addBottomAfter = txt => bottomAfterText += txt + '\n';

// Offsets
let topBeforeOffset = { index: 1 };
let topAfterOffset = { index: 1 };
let bottomBeforeOffset = { index: 1 };
let bottomAfterOffset = { index: 1 };

// Export gingiva
exportGingiva('GingivaMorphUpper Jaw0', addTopBefore, addTopAfter, topBeforeOffset, topAfterOffset);
exportGingiva('GingivaMorphLower Jaw0', addBottomBefore, addBottomAfter, bottomBeforeOffset, bottomAfterOffset);

// Export teeth
for (let i = 0; i < 36; i++) {
    if (i < 18) {
        exportTooth(i, addTopBefore, addTopAfter, topBeforeOffset, topAfterOffset);
    } else {
        exportTooth(i, addBottomBefore, addBottomAfter, bottomBeforeOffset, bottomAfterOffset);
    }
}

// Download function
function makeTextFile(text, filename) {
    let data = new Blob([text], {type: 'text/plain'});
    const blobUrl = URL.createObjectURL(data);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    document.body.removeChild(link);
}

// Create files
makeTextFile(topBeforeText, "top_before.obj");
makeTextFile(topAfterText, "top_after.obj");
makeTextFile(bottomBeforeText, "bottom_before.obj");
makeTextFile(bottomAfterText, "bottom_after.obj");
