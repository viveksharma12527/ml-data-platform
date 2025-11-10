const annotationService = require('./annotation.service');


async function saveAnnotation(req, res){
    try {
      const annotator_id = req.user.id;
      const { project_id, image_id, label_class_id } = req.body;
      if (!project_id || !image_id)
        return res.status(400).json({ error: 'Missing required fields'});
      
      const annotation = await annotationService.saveAnnotation(
        project_id,
        image_id,
        annotator_id,
        label_class_id
      );

      res.status(201).json(annotation);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Error failed to save annotation' });
    }
};


async function getNextImage(req, res){
    try {
        const annotator_id = req.user.id;
        const { project_id } = req.body;
        if( !project_id || !annotator_id)
            return res.status(400).json({ error: 'Missing required fields' });
        const nextImage = await annotationService.getNextImage(project_id,annotator_id);
        return res.status(200).json(nextImage);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error failed to retrieve next image' });
    }
};

module.exports = { saveAnnotation, getNextImage};