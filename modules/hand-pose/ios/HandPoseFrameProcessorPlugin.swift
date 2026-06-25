import CoreMedia
import Foundation
import Vision
import VisionCamera

// Apple Vision hand-pose detector exposed as a VisionCamera frame processor.
// Returns an array of hands; each hand is 21 landmarks {x, y, z} in MediaPipe
// order, so it maps directly onto the JS gesture classifier.
@objc(HandPoseFrameProcessorPlugin)
public class HandPoseFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  // MediaPipe 21-point order. Apple's joints map 1:1 onto it.
  private let joints: [VNHumanHandPoseObservation.JointName] = [
    .wrist,
    .thumbCMC, .thumbMP, .thumbIP, .thumbTip,
    .indexMCP, .indexPIP, .indexDIP, .indexTip,
    .middleMCP, .middlePIP, .middleDIP, .middleTip,
    .ringMCP, .ringPIP, .ringDIP, .ringTip,
    .littleMCP, .littlePIP, .littleDIP, .littleTip,
  ]

  public override func callback(_ frame: Frame, withArguments _: [AnyHashable: Any]?) -> Any? {
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return []
    }

    let request = VNDetectHumanHandPoseRequest()
    request.maximumHandCount = 2

    // NOTE: orientation may need tuning on-device for the front camera
    // (e.g. .leftMirrored). Start with .up and adjust during QA.
    let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
    do {
      try handler.perform([request])
    } catch {
      return []
    }

    guard let observations = request.results, !observations.isEmpty else {
      return []
    }

    var hands: [[[String: Double]]] = []
    for observation in observations {
      var points: [[String: Double]] = []
      for joint in joints {
        if let recognized = try? observation.recognizedPoint(joint), recognized.confidence > 0.3 {
          // Vision normalized coords use a bottom-left origin; flip Y so the
          // engine sees a top-left origin (smaller y == higher in frame).
          points.append([
            "x": Double(recognized.location.x),
            "y": Double(1.0 - recognized.location.y),
            "z": 0.0,
          ])
        } else {
          points.append(["x": 0.0, "y": 0.0, "z": 0.0])
        }
      }
      hands.append(points)
    }
    return hands
  }
}
