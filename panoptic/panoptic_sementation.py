import argparse
import torch, torchvision
print(torch.__version__, torch.cuda.is_available())
# Some basic setup:
# Setup detectron2 logger
import detectron2
from detectron2.utils.logger import setup_logger
setup_logger()

# import some common libraries
import numpy as np
import os, json, cv2, random

# import some common detectron2 utilities
from detectron2 import model_zoo
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog, DatasetCatalog

cfg = get_cfg()

def load_model():
    # Panoptic Segmentation
    # Ref: https://youtu.be/Pb3opEFP94U
    # add project-specific config (e.g., TensorMask) here if you're not running a model in detectron2's core library
    cfg.merge_from_file(model_zoo.get_config_file("COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml"))
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5  # set threshold for this model
    # Find a model from detectron2's model zoo. You can use the https://dl.fbaipublicfiles... url as well
    cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-PanopticSegmentation/panoptic_fpn_R_101_3x.yaml")

def pred(fileName):
    predictor = DefaultPredictor(cfg)
    # define a video capture object and source video
    vid = cv2.VideoCapture(f'./videos/original/{fileName}.mp4')

    # define video writer object
    videoWidth = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
    videoHeight = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = vid.get(cv2.CAP_PROP_FPS)
    codec = int(vid.get(cv2.CAP_PROP_FOURCC))
    print(fps,vid.get(cv2.CAP_PROP_FOURCC))

    output = cv2.VideoWriter(f'./videos/panoptic/{fileName}.mp4', codec, fps, (videoWidth,videoHeight))
    # fourcc = cv2.VideoWriter_fourcc(*'XVID')
    # Set the frame rate to match your source video (change the 24.0 value if needed)
    # output = cv2.VideoWriter(f'../videos/panoptic/{fileName}.mp4', fourcc, 24.0, (videoWidth,videoHeight))
    
    # Capture the video frame by frame
    ret, frame = vid.read()

    while(ret):
        # Panoptic Segmentation Visualizer
        # We can use `Visualizer` to draw the predictions on the image.
        predictions, segmentInfo = predictor(frame)["panoptic_seg"]
        # show full segmentation image
        v = Visualizer(frame[:, :, ::-1], MetadataCatalog.get(cfg.DATASETS.TRAIN[0]), scale=1)
        # OR Optional to show only segmentation image
        # frame = np.zeros((360, 640,3), np.uint8)
        #v = Visualizer(frame[:, :, ::-1], MetadataCatalog.get(cfg.DATASETS.TRAIN[0]), scale=1)
        
        # Uncomment to filter out specific segments (road only)
        # out = v.draw_panoptic_seg_predictions(predictions.to("cpu"), list(filter(lambda x: x['category_id'] == 21, segmentInfo)), area_threshold=.1)
        
        out = v.draw_panoptic_seg_predictions(predictions.to("cpu"), segmentInfo, area_threshold=.1)
        output.write(out.get_image()[:, :, ::-1])
        # display in notebook
        # cv2_imshow(out.get_image()[:, :, ::-1])
        
        # Capture the video frame by frame
        ret, frame = vid.read()
    
    # # After the loop release the cap object
    vid.release()
    output.release()
    # # Destroy all the windows
    cv2.destroyAllWindows()
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run Panoptic Segmentation on a video.')
    parser.add_argument('fileName', type=str, help='Name of the video file (without extension)')
    args = parser.parse_args()

    load_model()
    pred(args.fileName)