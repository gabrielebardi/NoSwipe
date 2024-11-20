//
//  ContentView.swift
//  NoSwipeApp
//
//  Created by G B on 11/18/2024.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome to NoSwipeApp")
                    .font(.largeTitle)
                    .padding()
                
                NavigationLink(destination: RegisterView()) {
                    Text("Register")
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.green)
                        .cornerRadius(8)
                }
                .padding([.leading, .trailing, .bottom], 10)
                
                NavigationLink(destination: LoginView()) {
                    Text("Login")
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(8)
                }
                .padding([.leading, .trailing, .bottom], 10)
                
                Spacer()
            }
            .padding()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
