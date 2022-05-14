async function getResources({ client }) {
  const resources = await client.Page.getResourceTree();
  const frameTree = resources.frameTree;
  const framesResources = {};

  getFrameResources(frameTree, framesResources);
  return framesResources;
}

function getFrameResources(frameTree, resources) {
  const frame = frameTree.frame;
  const frameObj = (resources[frame.id] = {});

  frameObj.url = frame.url;
  frameObj.name = frame.name;
  frameObj.resources = frameTree.resources;
  frameObj.contentSize = {};

  if (frameObj.resources) {
    for (let i = 0; i < frameObj.resources.length; i++) {
      const resource = frameObj.resources[i];
      frameObj.contentSize[resource.type] =
        frameObj.contentSize[resource.type] || 0;
      frameObj.contentSize[resource.type] += resource.contentSize;
    }
  }

  if (frameTree.childFrames) {
    for (let i = 0; i < frameTree.childFrames.length; i++) {
      frameObj.children = frameObj.children || [];
      const childFrame = frameTree.childFrames[i];
      frameObj.children.push(childFrame.frame.id);
      getFrameResources(childFrame, resources);
    }
  }
}

module.exports = {
  getResources,
};
