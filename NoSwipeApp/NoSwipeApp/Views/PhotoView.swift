import SwiftUI

struct PhotoView: View {
    let photo: Photo
    
    var body: some View {
        AsyncImage(url: URL(string: photo.image_url)) { phase in
            switch phase {
            case .empty:
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: 400)
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxWidth: .infinity, maxHeight: 400)
                    .cornerRadius(10)
            case .failure:
                Image(systemName: "photo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxWidth: .infinity, maxHeight: 400)
                    .foregroundColor(.gray)
            @unknown default:
                EmptyView()
            }
        }
        .padding()
    }
} 