const annotationRepo = require('./annotation.repository');

async function saveAnnotation(projectId, imageId, annotatorId, labelClassId){

  /* validate that the class belongs to the label type assigned to the project
  after implementing the repository for label tpye and full project */
  
  const annotation = await annotationRepo.saveAnnotation(
    projectId,
    imageId,
    annotatorId,
    labelClassId || null
  );

  return annotation;
}

async function getNextImage(projectId, annotatorId){
    const nextImage = await annotationRepo.getNextImage(
        projectId,
        annotatorId
    );

    return nextImage;
}

module.exports = { getNextImage, saveAnnotation };
