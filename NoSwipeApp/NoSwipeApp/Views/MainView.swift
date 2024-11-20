//
//  MainView.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//

import SwiftUI

struct MainView: View {
    @State private var isLoggedOut = false
    
    var body: some View {
        VStack {
            Text("Welcome to NoSwipeApp!")
                .font(.largeTitle)
                .padding()
            
            Button(action: {
                // Delete token from Keychain
                KeychainHelper.shared.delete(service: "NoSwipeApp", account: "authToken")
                self.isLoggedOut = true
            }) {
                Text("Logout")
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.red)
                    .cornerRadius(8)
            }
            .padding([.leading, .trailing], 10)
            
            Spacer()
        }
        .padding()
        .fullScreenCover(isPresented: $isLoggedOut) {
            // Navigate back to the login screen
            LoginView()
        }
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
