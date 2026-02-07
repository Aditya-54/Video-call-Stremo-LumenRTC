#include "HardwareProvider.hpp"
#include <iostream>
#include <cassert>

int main() {
    std::cout << "Running Hardware Probe Test...\n";

    auto specs = HardwareProvider::getCapabilities();

    std::cout << "Detected Hardware Cores: " << specs.cpuCores << "\n";
    std::cout << "Detected CUDA: " << (specs.hasCuda ? "Yes" : "No") << "\n";
    if (specs.hasCuda) {
        std::cout << "GPU Name: " << specs.gpuName << "\n";
    }
    
    std::cout << "Assigned Tier: " << HardwareProvider::tierToString(specs.tier) << "\n";

    // Basic Validation Logic
    if (specs.hasCuda) {
        assert(specs.tier == HardwareTier::TIER_1_RTX);
        std::cout << "[PASS] GPU detected, Tier 1 assigned.\n";
    } else if (specs.cpuCores > 12) {
        assert(specs.tier == HardwareTier::TIER_2_HIGH_CPU);
        std::cout << "[PASS] High Core CPU detected, Tier 2 assigned.\n";
    } else {
        assert(specs.tier == HardwareTier::TIER_3_NORMAL_CPU);
        std::cout << "[PASS] Standard CPU detected, Tier 3 assigned.\n";
    }

    return 0;
}
