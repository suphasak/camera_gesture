import CoreMedia
import Foundation
import Vision
import VisionCamera

// Apple Vision frame processor: returns both hand landmarks and faces.
//   { "hands": [[{x,y,z} × 21], ...], "faces": [{cx,cy,w,h,yaw}, ...] }
// Coordinates are normalized with a top-left origin (smaller y == higher).
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
    let empty: [String: Any] = ["hands": [], "faces": []]
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return empty
    }

    let handRequest = VNDetectHumanHandPoseRequest()
    handRequest.maximumHandCount = 4 // up to two people, a hand each (plus slack)

    let faceRequest = VNDetectFaceRectanglesRequest()
    faceRequest.revision = VNDetectFaceRectanglesRequestRevision3 // provides yaw

    // NOTE: orientation may need tuning on-device for the front camera
    // (e.g. .leftMirrored). Start with .up and adjust during QA.
    let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
    do {
      try handler.perform([handRequest, faceRequest])
    } catch {
      return empty
    }

    var hands: [[[String: Double]]] = []
    for observation in handRequest.results ?? [] {
      var points: [[String: Double]] = []
      for joint in joints {
        if let recognized = try? observation.recognizedPoint(joint), recognized.confidence > 0.3 {
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

    var faces: [[String: Double]] = []
    for face in faceRequest.results ?? [] {
      let box = face.boundingBox // normalized, bottom-left origin
      faces.append([
        "cx": Double(box.midX),
        "cy": Double(1.0 - box.midY), // flip to top-left origin
        "w": Double(box.width),
        "h": Double(box.height),
        "yaw": face.yaw?.doubleValue ?? 0.0,
      ])
    }

    return ["hands": hands, "faces": faces]
  }
}
