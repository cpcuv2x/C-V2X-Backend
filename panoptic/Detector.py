from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.data import MetadataCatalog
from detectron2.utils.visualizer import Visualizer, ColorMode
from detectron2 import model_zoo

import cv2
import numpy as np

class Detector:
    def __init__(self):
        self.cfg = get_cfg()

        self.cfg.merge_from_file(model_zoo.get_config_file("COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml"))
        self.cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml")
        
        self.cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.7  # set threshold for this model
        self.cfg.MODEL.DEVICE = "cuda"

        self.predictor = DefaultPredictor(self.cfg)

    def onVideo(self, fileName):
        cap = cv2.VideoCapture(f'C:/data/videos/original/{fileName}.mp4')

        # define video writer object
        videoWidth = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        videoHeight = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        codec = int(cap.get(cv2.CAP_PROP_FOURCC))
        print(fps,cap.get(cv2.CAP_PROP_FOURCC))

        output = cv2.VideoWriter(f'C:/data/videos/panoptic/{fileName}.mp4', codec, 15, (videoWidth,videoHeight))

        if cap.isOpened() == False :
            print("Error opening file ...")
            return

        (success, image) = cap.read()

        while success:
            predictions, segmentInfo = self.predictor(image)["panoptic_seg"]
            v = Visualizer(image[:, :, ::-1], MetadataCatalog.get(self.cfg.DATASETS.TRAIN[0]))
            
            out = v.draw_panoptic_seg_predictions(predictions.to("cpu"), segmentInfo)
            output.write(out.get_image()[:, :, ::-1])
            # cv2.imshow("test",out.get_image()[:, :, ::-1])
            

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            (success, image) = cap.read()
        # # After the loop release the cap object
        cap.release()
        output.release()
        # # Destroy all the windows
        cv2.destroyAllWindows()