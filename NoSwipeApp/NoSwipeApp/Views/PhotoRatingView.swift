//
//  PhotoRatingView.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//


import SwiftUI

struct PhotoRatingView: View {
    @State private var photos: [UIImage] = [] // Replace with actual photo data
    @State private var currentPhotoIndex = 0
    @State private var ratings: [Int] = []
    @State private var isCompleted = false
    
    var body: some View {
        VStack {
            if isCompleted {
                Text("Photo Rating Completed!")
                    .font(.title)
            } else {
                if currentPhotoIndex < photos.count {
                    Image(uiImage: photos[currentPhotoIndex])
                        .resizable()
                        .scaledToFit()
                        .frame(height: 300)
                        .padding()
                    
                    HStack {
                        ForEach(1...5, id: \.self) { rating in
                            Button(action: {
                                ratings.append(rating)
                                currentPhotoIndex += 1
                                if currentPhotoIndex == photos.count {
                                    isCompleted = true
                                    // Optionally navigate to the next step
                                }
                            }) {
                                Text("\(rating)")
                                    .font(.largeTitle)
                                    .frame(width: 50, height: 50)
                                    .background(Color.gray.opacity(0.2))
                                    .cornerRadius(25)
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .padding()
        .onAppear {
            // Load photos from your source
            // For MVP, you can use placeholder images
            photos = [UIImage(named: "photo1")!, UIImage(named: "photo2")!]
        }
    }
}

struct PhotoRatingView_Previews: PreviewProvider {
    static var previews: some View {
        PhotoRatingView()
    }
}