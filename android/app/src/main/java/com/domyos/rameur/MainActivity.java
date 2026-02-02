package com.domyos.rameur;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(com.capacitorjs.community.plugins.bluetoothle.BluetoothLe.class);
    }
}
