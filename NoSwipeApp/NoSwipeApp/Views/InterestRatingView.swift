//
//  InterestRatingView.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//


import SwiftUI

struct InterestRatingView: View {
    @State private var interests: [String] = [] // Fetch from backend
    @State private var currentInterestIndex = 0
    @State private var ratings: [Int] = []
    @State private var isCompleted = false
    
    var body: some View {
        VStack {
            if isCompleted {
                Text("Interest Rating Completed!")
                    .font(.title)
            } else {
                if currentInterestIndex < interests.count {
                    Text("Rate your interest in:")
                        .font(.headline)
                    
                    Text(interests[currentInterestIndex])
                        .font(.largeTitle)
                        .padding()
                    
                    HStack {
                        ForEach(1...5, id: \.self) { rating in
                            Button(action: {
                                ratings.append(rating)
                                currentInterestIndex += 1
                                if currentInterestIndex == interests.count {
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
            // Fetch interests from the backend
            fetchInterests()
        }
    }
    
    func fetchInterests() {
        guard let url = URL(string: "http://127.0.0.1:8000/api/interests/") else { return }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let data = data {
                if let decoded = try? JSONDecoder().decode([Interest].self, from: data) {
                    DispatchQueue.main.async {
                        self.interests = decoded.map { $0.name }
                    }
                }
            }
        }.resume()
    }
}

struct Interest: Codable, Identifiable {
    let id: Int
    let name: String
}

struct InterestRatingView_Previews: PreviewProvider {
    static var previews: some View {
        InterestRatingView()
    }
}