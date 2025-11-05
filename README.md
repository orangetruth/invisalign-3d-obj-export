# invisalign-3d-obj-export
a chrome extension to export invisalign scans to 3d printable object files

# Instructions
1. Download or clone this repo, then go to `chrome://extensions/`, click Load unpacked, and select the repo folder to install the extension

![image](https://github.com/user-attachments/assets/4d873136-991c-48de-9f77-d27f8177fad7)

![image](https://github.com/user-attachments/assets/1a385409-fb91-4315-9341-355ad1f8d347)

2. Open your share.invisalign.com treatment outcome simulation in the Simulation Viewer, go to the extension, and choose Export Mesh to download before and after files for your top and bottom teeth

<img width="1125" height="1789" alt="image" src="https://github.com/user-attachments/assets/dc279b57-9229-4371-9fab-1dbe6935a886" />

![image](https://github.com/user-attachments/assets/24340812-2d0e-4a33-b803-9a3d6492c5c1)

3. When importing into a slicer such as SuperSlicer, make sure to select Yes to recalculate the dimensions of the object:

![image](https://github.com/user-attachments/assets/0375644f-5159-4da4-bf5c-52822f709708)

# What if I don't want to use Chrome?

Copy the code from [invisalignToObj.js](https://github.com/orangetruth/invisalign-3d-obj-export/blob/main/invisalignToObj.js) and paste it into the console of any web browser and run it.

