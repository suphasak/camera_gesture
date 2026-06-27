import AVFoundation
import ExpoModulesCore
import UIKit

// Expo module exposing `overlayHearts(uri)` — bakes floating heart balloons into
// a recorded video using AVFoundation + Core Animation, and returns a new file.
public class HandPoseModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HandPose")

    AsyncFunction("overlayHearts") { (uri: String, promise: Promise) in
      HeartOverlay.render(inputUri: uri, promise: promise)
    }
  }
}

enum HeartOverlay {
  static func render(inputUri: String, promise: Promise) {
    let cleanPath = inputUri.replacingOccurrences(of: "file://", with: "")
    let inputURL = URL(fileURLWithPath: cleanPath)
    let asset = AVURLAsset(url: inputURL)

    guard asset.tracks(withMediaType: .video).first != nil else {
      promise.resolve(inputUri) // nothing to do — hand back the original
      return
    }

    // Let AVFoundation build the correct instructions / render size / transform
    // from the asset. Doing this manually is what was blacking out the video.
    let videoComposition = AVMutableVideoComposition(propertiesOf: asset)
    let renderSize = videoComposition.renderSize
    guard renderSize.width > 0, renderSize.height > 0 else {
      promise.resolve(inputUri)
      return
    }

    // Core Animation layer tree: video underneath, animated hearts on top.
    let parentLayer = CALayer()
    let videoLayer = CALayer()
    parentLayer.frame = CGRect(origin: .zero, size: renderSize)
    videoLayer.frame = CGRect(origin: .zero, size: renderSize)
    parentLayer.addSublayer(videoLayer)
    addHearts(to: parentLayer, size: renderSize, duration: asset.duration.seconds)

    videoComposition.animationTool = AVVideoCompositionCoreAnimationTool(
      postProcessingAsVideoLayer: videoLayer, in: parentLayer)

    let outputURL = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent("couple-heart-\(UUID().uuidString).mov")

    guard
      let export = AVAssetExportSession(
        asset: asset, presetName: AVAssetExportPresetHighestQuality)
    else {
      promise.resolve(inputUri)
      return
    }
    export.outputURL = outputURL
    export.outputFileType = .mov
    export.videoComposition = videoComposition

    export.exportAsynchronously {
      DispatchQueue.main.async {
        if export.status == .completed {
          promise.resolve(outputURL.absoluteString)
        } else {
          promise.resolve(inputUri) // fall back to the un-decorated clip
        }
      }
    }
  }

  /// Add floating heart balloons that rise, sway, and fade over the clip.
  private static func addHearts(to parent: CALayer, size: CGSize, duration: Double) {
    let count = 14
    let dur = max(duration, 1.0)
    for i in 0..<count {
      let heart = makeHeartLayer(size: size)
      let startX = CGFloat.random(in: 0.1...0.9) * size.width
      let drift = CGFloat.random(in: -0.06...0.06) * size.width
      let beginAt = Double(i) / Double(count) * dur * 0.7

      // Rise from below the frame to above it.
      let rise = CABasicAnimation(keyPath: "position.y")
      rise.fromValue = -0.1 * size.height
      rise.toValue = 1.15 * size.height
      // Gentle horizontal sway.
      let sway = CABasicAnimation(keyPath: "position.x")
      sway.fromValue = startX
      sway.toValue = startX + drift
      sway.autoreverses = true
      sway.duration = 0.9
      sway.repeatCount = .greatestFiniteMagnitude
      // Fade out near the top.
      let fade = CAKeyframeAnimation(keyPath: "opacity")
      fade.values = [0.0, 1.0, 1.0, 0.0]
      fade.keyTimes = [0.0, 0.15, 0.7, 1.0]

      for anim in [rise, fade] {
        anim.duration = dur
        anim.beginTime = AVCoreAnimationBeginTimeAtZero + beginAt
        anim.isRemovedOnCompletion = false
        anim.fillMode = .forwards
      }
      sway.beginTime = AVCoreAnimationBeginTimeAtZero + beginAt

      heart.position = CGPoint(x: startX, y: -0.1 * size.height)
      heart.opacity = 0
      heart.add(rise, forKey: "rise")
      heart.add(sway, forKey: "sway")
      heart.add(fade, forKey: "fade")
      parent.addSublayer(heart)
    }
  }

  private static func makeHeartLayer(size: CGSize) -> CAShapeLayer {
    let s = CGFloat.random(in: 0.05...0.1) * min(size.width, size.height)
    let layer = CAShapeLayer()
    layer.path = heartPath(width: s, height: s).cgPath
    let pinks: [UIColor] = [
      UIColor(red: 1.0, green: 0.36, blue: 0.46, alpha: 1),
      UIColor(red: 1.0, green: 0.45, blue: 0.62, alpha: 1),
      UIColor(red: 0.98, green: 0.28, blue: 0.40, alpha: 1),
    ]
    layer.fillColor = pinks.randomElement()!.cgColor
    layer.bounds = CGRect(x: 0, y: 0, width: s, height: s)
    // The video animation tool composites in a bottom-left coordinate space, so
    // flip each heart vertically to keep it pointing the right way up.
    layer.transform = CATransform3DMakeScale(1, -1, 1)
    return layer
  }

  private static func heartPath(width: CGFloat, height: CGFloat) -> UIBezierPath {
    let p = UIBezierPath()
    p.move(to: CGPoint(x: width / 2, y: height))
    p.addCurve(
      to: CGPoint(x: 0, y: height / 4),
      controlPoint1: CGPoint(x: width / 2, y: height * 3 / 4),
      controlPoint2: CGPoint(x: 0, y: height / 2))
    p.addArc(
      withCenter: CGPoint(x: width / 4, y: height / 4), radius: width / 4,
      startAngle: .pi, endAngle: 0, clockwise: true)
    p.addArc(
      withCenter: CGPoint(x: width * 3 / 4, y: height / 4), radius: width / 4,
      startAngle: .pi, endAngle: 0, clockwise: true)
    p.addCurve(
      to: CGPoint(x: width / 2, y: height),
      controlPoint1: CGPoint(x: width, y: height / 2),
      controlPoint2: CGPoint(x: width / 2, y: height * 3 / 4))
    p.close()
    return p
  }
}
