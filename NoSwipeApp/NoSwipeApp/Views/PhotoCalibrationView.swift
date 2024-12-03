import SwiftUI

struct PhotoCalibrationView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var photos: [Photo] = []
    @State private var currentIndex: Int = 0
    @State private var isLoading: Bool = true
    @State private var errorMessage: String = ""
    @State private var ratings: [Int] = []
    @State private var isCompleted: Bool = false
    let preferredGender: String
    var onComplete: ((Bool) -> Void)?
    
    var body: some View {
        VStack {
            if isLoading {
                LoadingView()
            } else if !errorMessage.isEmpty {
                ErrorView(message: errorMessage)
            } else if isCompleted {
                CompletionView {
                    trainAIModel()
                }
            } else if let photo = photos[safe: currentIndex] {
                CalibrationContentView(
                    photo: photo,
                    currentIndex: currentIndex,
                    totalPhotos: photos.count,
                    rating: Binding(
                        get: { Double(ratings[safe: currentIndex] ?? 5) },
                        set: { newValue in
                            if currentIndex < ratings.count {
                                ratings[currentIndex] = Int(newValue)
                            }
                        }
                    ),
                    onSwipe: handleSwipe,
                    onSubmit: submitRating
                )
            }
        }
        .navigationTitle("Photo Calibration")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            fetchCalibrationPhotos()
        }
    }
    
    // MARK: - Helper Views
    
    private struct LoadingView: View {
        var body: some View {
            VStack(spacing: 20) {
                ProgressView()
                Text("Loading Calibration Photos...")
                    .foregroundColor(.secondary)
            }
            .padding()
        }
    }
    
    private struct ErrorView: View {
        let message: String
        
        var body: some View {
            VStack(spacing: 20) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 50))
                    .foregroundColor(.red)
                Text(message)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }
            .padding()
        }
    }
    
    private struct CompletionView: View {
        let onAppear: () -> Void
        
        var body: some View {
            VStack(spacing: 20) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.green)
                
                Text("Calibration Complete!")
                    .font(.title)
                    .bold()
                
                Text("Thank you for helping us understand your preferences.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
            }
            .padding()
            .onAppear(perform: onAppear)
        }
    }
    
    private struct CalibrationContentView: View {
        let photo: Photo
        let currentIndex: Int
        let totalPhotos: Int
        @Binding var rating: Double
        let onSwipe: (CGSize) -> Void
        let onSubmit: () -> Void
        
        var body: some View {
            VStack(spacing: 20) {
                // Progress indicator
                Text("Photo \(currentIndex + 1) of \(totalPhotos)")
                    .foregroundColor(.secondary)
                
                // Photo display
                AsyncImage(url: URL(string: photo.image_url)) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(maxHeight: 400)
                    case .failure:
                        Image(systemName: "photo")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(maxHeight: 400)
                            .foregroundColor(.gray)
                    @unknown default:
                        EmptyView()
                    }
                }
                .cornerRadius(10)
                .shadow(radius: 5)
                .gesture(
                    DragGesture()
                        .onEnded { value in
                            onSwipe(value.translation)
                        }
                )
                
                // Rating controls
                VStack(spacing: 10) {
                    Text("Rate this photo: \(Int(rating))")
                        .font(.headline)
                    
                    Slider(value: $rating, in: 1...10, step: 1)
                        .padding(.horizontal)
                    
                    Button(action: onSubmit) {
                        Text("Submit Rating")
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [.blue, .purple]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(10)
                    }
                    .padding(.horizontal)
                }
            }
            .padding()
        }
    }
    
    // MARK: - Network Methods
    
    private func fetchCalibrationPhotos() {
        isLoading = true
        NetworkManager.shared.fetchCalibrationPhotos(gender: preferredGender) { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success(let fetchedPhotos):
                    photos = fetchedPhotos
                    ratings = Array(repeating: 5, count: fetchedPhotos.count)
                case .failure(let error):
                    errorMessage = "Failed to load photos: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func handleSwipe(translation: CGSize) {
        guard currentIndex < photos.count else { return }
        
        if translation.width < -100 {
            ratings[currentIndex] = 1
        } else if translation.width > 100 {
            ratings[currentIndex] = 10
        }
        
        submitRating()
    }
    
    private func submitRating() {
        guard let photo = photos[safe: currentIndex] else { return }
        
        NetworkManager.shared.submitPhotoRating(photoId: photo.id, rating: ratings[currentIndex]) { result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    advanceToNextPhoto()
                case .failure(let error):
                    errorMessage = "Failed to submit rating: \(error.localizedDescription)"
                }
            }
        }
    }
    
    private func advanceToNextPhoto() {
        currentIndex += 1
        if currentIndex >= photos.count {
            isCompleted = true
        }
    }
    
    private func trainAIModel() {
        NetworkManager.shared.trainUserModel(userId: "currentUserId") { result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    onComplete?(true)
                case .failure(let error):
                    errorMessage = "Failed to train AI model: \(error.localizedDescription)"
                    onComplete?(false)
                }
            }
        }
    }
}
