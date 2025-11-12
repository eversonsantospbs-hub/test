package com.seuapp.soelasstudio;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.content.Context;

public class MainActivity extends Activity {
    
    private WebView webView;
    private ProgressBar progressBar;
    
    // SUBSTITUA PELA SUA URL DO VERCEL APÓS O DEPLOY
    private static final String APP_URL = "https://salao-app-iota.vercel.app/";
    
    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Verificar conexão com internet
        if (!isNetworkAvailable()) {
            Toast.makeText(this, "Sem conexão com a internet", Toast.LENGTH_LONG).show();
            return;
        }
        
        // Inicializar componentes
        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progress_bar);
        
        // Configurar WebView
        setupWebView();
        
        // Carregar aplicação
        webView.loadUrl(APP_URL);
    }
    
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        
        // Habilitar JavaScript (necessário para React/Next.js)
        webSettings.setJavaScriptEnabled(true);
        
        // Habilitar armazenamento local (importante para PWA)
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        
        // Configurações de cache para melhor performance
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Configurações de zoom
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        
        // Configurações de viewport para responsividade
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        
        // Permitir conteúdo misto (HTTP/HTTPS) - apenas para desenvolvimento
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Melhorar performance
        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Configurar WebViewClient para controlar navegação
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Manter navegação dentro do WebView
                if (url.startsWith(APP_URL)) {
                    view.loadUrl(url);
                    return true;
                }
                return false;
            }
            
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                // Mostrar loading
                progressBar.setVisibility(View.VISIBLE);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Esconder loading
                progressBar.setVisibility(View.GONE);
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                Toast.makeText(MainActivity.this, "Erro ao carregar: " + description, Toast.LENGTH_LONG).show();
            }
        });
        
        // Configurar WebChromeClient para melhor suporte
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                progressBar.setProgress(newProgress);
                
                // Esconder progress bar quando carregamento completo
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });
    }
    
    // Verificar conexão com internet
    private boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager = 
            (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }
    
    @Override
    public void onBackPressed() {
        // Permitir navegação para trás no WebView
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (webView != null) {
            webView.destroy();
        }
    }
}