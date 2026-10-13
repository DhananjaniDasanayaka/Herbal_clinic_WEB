
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image, UnidentifiedImageError
import cv2
import io

app = Flask(__name__)
CORS(app)

# Load existing AI model
print("Loading AI Brain... Please wait.")

model = tf.keras.models.load_model('dosha_model.keras')

class_names = ['Balanced', 'Kapha', 'Pitta', 'Vata']

# NEW: Load OpenCV face detector
face_detector = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    'haarcascade_frontalface_default.xml'
)

if face_detector.empty():
    raise RuntimeError("Could not load face detector.")

print("✅ AI Ready to accept images!")


@app.route('/predict', methods=['POST'])
def predict_dosha():

    # Check uploaded image
    if 'file' not in request.files:
        return jsonify({
            'error': 'No file uploaded.'
        }), 400

    file = request.files['file']

    try:
        # Open original image
        original_image = Image.open(
            io.BytesIO(file.read())
        ).convert('RGB')

    except (UnidentifiedImageError, OSError):
        return jsonify({
            'error': 'Invalid image. Please try again.'
        }), 400

    try:
        # NEW: Check for face before AI prediction
        image_array = np.array(original_image)

        gray_image = cv2.cvtColor(
            image_array,
            cv2.COLOR_RGB2GRAY
        )

        faces = face_detector.detectMultiScale(
            gray_image,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(50, 50)
        )

        # If no face, stop prediction
        if len(faces) == 0:
            return jsonify({
                'error': 'Face not detected. Please try again.'
            }), 400

        print("✅ Face detected. Starting AI prediction...")

        # Existing MobileNetV2 preprocessing
        image = original_image.resize((224, 224))

        img_array = tf.keras.utils.img_to_array(image)

        img_array = tf.expand_dims(img_array, 0)

        # AI prediction
        predictions = model.predict(
            img_array,
            verbose=0
        )

        winning_index = int(np.argmax(predictions[0]))

        winning_class = class_names[winning_index]

        confidence_score = float(
            predictions[0][winning_index]
        )

        # Return result to React
        return jsonify({
            'dosha': winning_class,
            'confidence': round(confidence_score * 100, 2)
        })

    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({
            'error': 'Image analysis failed. Please try again.'
        }), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)
