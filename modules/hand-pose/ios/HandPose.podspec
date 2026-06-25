Pod::Spec.new do |s|
  s.name           = 'HandPose'
  s.version        = '1.0.0'
  s.summary        = 'Apple Vision hand-pose frame processor plugin for VisionCamera'
  s.description    = 'On-device 21-point hand landmark detection via VNDetectHumanHandPoseRequest, exposed to VisionCamera as the "detectHands" frame processor.'
  s.author         = 'Gesture Camera'
  s.homepage       = 'https://github.com/suphasak/camera_gesture'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '14.0' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'VisionCamera'

  s.source_files = '**/*.{h,m,mm,swift}'
end
